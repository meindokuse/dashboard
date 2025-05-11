from datetime import datetime
from asgiref.sync import async_to_sync
from src.data.unitofwork import UnitOfWork
from src.celery_app import celery_app
from src.parsers.binance import BinanceParser
from src.parsers.moex import MoexParser
from src.schemas.rate import ExchangeRateCreate
from src.services.currency_service import CurrencyService
from src.services.rate_service import RateService
import logging

logger = logging.getLogger(__name__)

@celery_app.task
def update_currency_rates():
    """Задача Celery для обновления курсов валют."""
    try:
        moex_rates = MoexParser.get_rates()
        binance_rates = BinanceParser.get_rates()
        logger.info(f"Fetched rates: MOEX={len(moex_rates)}, Binance={len(binance_rates)}")
    except Exception as e:
        logger.error(f"Error fetching rates: {e}")
        return

    async def process_rates(rates: dict, source: str, is_crypto: bool = False):
        async with UnitOfWork() as uow:
            currency_service = CurrencyService(uow)
            rate_service = RateService(uow)
            
            for symbol, rate in rates.items():
                code = symbol.replace("USDT", "") if is_crypto else symbol
                try:
                    currency = await currency_service.get_by_code_for_celery(code)
                    if currency:
                        await rate_service.add_rate_for_celery(ExchangeRateCreate(
                            currency_id=currency.id,
                            rate=rate,
                            timestamp=datetime.utcnow(),
                            source=source
                        ))
                        logger.info(f"Saved {source} rate for {code}")
                except Exception as e:
                    logger.error(f"Failed to save {source} rate for {code}: {e}")
                    await uow.rollback()
                    continue
            await uow.commit()

    async def async_save_rates():
        await process_rates(moex_rates, "moex")
        await process_rates(binance_rates, "binance", is_crypto=True)

    async_to_sync(async_save_rates)()