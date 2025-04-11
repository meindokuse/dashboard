import asyncio
import logging
from datetime import datetime


from src.celery_app import celery_app
from src.data.unitofwork import UnitOfWork
from src.parsers.binance import BinanceParser
from src.parsers.moex import MoexParser
from src.schemas.rate import ExchangeRateRead, ExchangeRateCreate
from src.services.currency_service import CurrencyService
from src.services.rate_service import RateService


# Функция для запуска асинхронного кода в пуле потоков
def run_async_in_loop(coro):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()

@celery_app.task
def update_currency_rates():
    """Задача Celery для обновления курсов каждые 5 минут."""
    print("Starting currency rates update")
    try:
        moex_rates = MoexParser.get_rates()
        binance_rates = BinanceParser.get_rates()
    except Exception as e:
        print(f"Error fetching rates: {e}")
        return

    async def save_rates():
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
                else:
                    print(f"Currency {code} not found in database")

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
                else:
                    print(f"Currency {code} not found in database")

            # await uow.commit()
            print("Rates updated successfully")

    # Запускаем асинхронную функцию в новом событийном цикле
    run_async_in_loop(save_rates())

