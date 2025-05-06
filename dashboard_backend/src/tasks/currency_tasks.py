from datetime import datetime

from asgiref.sync import async_to_sync
from src.celery_app import celery_app
from src.data.unitofwork import UnitOfWork
from src.parsers.binance import BinanceParser
from src.parsers.moex import MoexParser
from src.schemas.rate import ExchangeRateCreate
from src.services.currency_service import CurrencyService
from src.services.rate_service import RateService

@celery_app.task
def update_currency_rates():
    """Задача Celery для обновления курсов валют."""
    try:
        moex_rates = MoexParser.get_rates()
        binance_rates = BinanceParser.get_rates()
    except Exception as e:
        print(f"Error fetching rates: {e}")
        return

    async def async_save_rates():
        async with UnitOfWork() as uow:
            currency_service = CurrencyService(uow)
            rate_service = RateService(uow)

            # Фиатные валюты (MOEX)
            for code, rate in moex_rates.items():
                currency = await currency_service.get_by_code(code)
                if currency:
                    rate_data = ExchangeRateCreate(
                        currency_id=currency.id,
                        rate=rate,
                        timestamp=datetime.utcnow(),
                        source="moex"
                    )
                    await rate_service.add_rate(rate_data)

            # Криптовалюты (Binance)
            for symbol, rate in binance_rates.items():
                code = symbol.replace("USDT", "")
                currency = await currency_service.get_by_code(code)
                if currency:
                    rate_data = ExchangeRateCreate(
                        currency_id=currency.id,
                        rate=rate,
                        timestamp=datetime.utcnow(),
                        source="binance"
                    )
                    await rate_service.add_rate(rate_data)

            await uow.commit()

    # Преобразуем асинхронную функцию в синхронную
    async_to_sync(async_save_rates)()