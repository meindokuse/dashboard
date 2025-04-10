import asyncio
from datetime import datetime

from src.celery_app import celery_app
from src.data.unitofwork import UnitOfWork
from src.parsers.binance import BinanceParser
from src.parsers.moex import MoexParser
from src.schemas.rate import ExchangeRateRead, ExchangeRateCreate
from src.services.currency_service import CurrencyService
from src.services.rate_service import RateService




@celery_app.task
def update_currency_rates():
    """Задача Celery для обновления курсов каждые 5 минут."""
    # Запускаем парсеры синхронно
    moex_rates = MoexParser.get_rates()
    binance_rates = BinanceParser.get_rates()

    # Асинхронная функция для работы с БД
    async def save_rates():
        async with UnitOfWork() as uow:  # Асинхронный контекст UoW
            currency_service = CurrencyService(uow)
            rate_service = RateService(uow)

            # Фиатные валюты (MOEX)
            for code, rate in moex_rates.items():
                currency = await currency_service.get_by_code(code)  # Асинхронный вызов
                if currency:
                    rate_data = ExchangeRateCreate(
                        currency_id=currency.id,
                        rate=rate,
                        timestamp=datetime.utcnow(),  # Текущая метка времени
                        source="moex"
                    )
                    await rate_service.add_rate(rate_data)  # Передаем объект

            # Криптовалюты (Binance)
            for symbol, rate in binance_rates.items():
                code = symbol.replace("USDT", "")  # BTCUSDT → BTC
                currency = await currency_service.get_by_code(code)  # Асинхронный вызов
                if currency:
                    rate_data = ExchangeRateCreate(
                        currency_id=currency.id,
                        rate=rate,
                        timestamp=datetime.utcnow(),  # Текущая метка времени
                        source="binance"
                    )
                    await rate_service.add_rate(rate_data)  # Передаем объект

            await uow.commit()  # Асинхронный коммит

    # Запускаем асинхронную функцию в синхронной задаче
    asyncio.run(save_rates())