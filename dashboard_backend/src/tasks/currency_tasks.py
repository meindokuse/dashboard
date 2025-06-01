import asyncio
from datetime import datetime, timezone, timedelta
from src.data.unitofwork import UnitOfWork
from src.celery_app import celery_app
from src.parsers.binance import BinanceParser
from src.schemas.rate import ExchangeRateCreate
from src.services.currency_service import CurrencyService
from src.services.portfolio_alert_service import PortfolioAlertService
from src.services.portfolio_service import PortfolioService
from src.services.rate_service import RateService
import logging

from src.services.user_service import UserService

logger = logging.getLogger(__name__)


@celery_app.task
def update_currency_rates():
    """Задача Celery для обновления курсов криптовалют и проверки алертов."""
    try:
        binance_rates = BinanceParser.get_rates()
        logger.info(f"Fetched rates: Binance={len(binance_rates)}")
    except Exception as e:
        logger.error(f"Error fetching rates: {e}")
        return

    async def process_rates(rates: dict, source: str):
        # Сохраняем курсы валют
        for symbol, rate in rates.items():
            async with UnitOfWork() as uow:
                currency_service = CurrencyService(uow)
                rate_service = RateService(uow)
                try:
                    currency = await currency_service.get_by_code_for_celery(symbol)
                    if not currency:
                        logger.warning(f"Currency {symbol} not found, skipping...")
                        continue
                        
                    await rate_service.add_rate_for_celery(ExchangeRateCreate(
                        currency_id=currency.id,
                        rate=rate,
                        timestamp=datetime.now() ,
                        source=source
                    ))
                    await uow.commit()
                except Exception as e:
                    logger.error(f"Failed to save {source} rate for {symbol}: {e}")
                    await uow.rollback()

        # Обрабатываем алерты (вынесено в отдельный блок)
        async with UnitOfWork() as uow:
            alert_service = PortfolioAlertService(uow)
            portfolio_service = PortfolioService(uow)
            user_service = UserService(uow)

            active_alerts = await alert_service.get_active_alerts()

            for alert in active_alerts:
                try:
                    portfolio_stats = await portfolio_service.calculate_portfolio_summary(alert.portfolio_id)
                    total_profit_percent = float(portfolio_stats['summary']['total_profit_percent'])
                    current_value = portfolio_stats['summary']['total_current_value']

                    if abs(total_profit_percent) >= abs(float(alert.threshold)):
                        user = await user_service.get_user_by_id(alert.user_id)

                        if alert.notification_channel == "email":
                            await alert_service.send_portfolio_email_alert(
                                email=user.email,
                                alert=alert,
                                current_value=current_value,
                                profit_percent=total_profit_percent
                            )
                        elif alert.notification_channel == "telegram":
                            await alert_service.send_portfolio_tg_alert(
                                unique_id=user.unique_id,
                                alert=alert,
                                current_value=current_value,
                                profit_percent=total_profit_percent
                            )

                        logger.info(f"Alert sent to user {alert.user_id} via {alert.notification_channel}")

                except Exception as e:
                    logger.error(f"Error processing alert {alert.id}: {e}")

    # Запуск асинхронного кода (с защитой от закрытого event loop)
    try:
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        loop.run_until_complete(process_rates(binance_rates, "binance"))
    except RuntimeError as e:
        logger.error(f"Error in event loop: {e}")
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(process_rates(binance_rates, "binance"))
