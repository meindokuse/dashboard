from src.celery_app import celery_app
from src.data.unitofwork import UnitOfWork
from src.parsers.binance import BinanceParser
from src.parsers.moex import MoexParser


@celery_app.task
def update_currency_rates():
    """Задача Celery для обновления курсов каждые 5 минут."""
    # Запускаем парсеры синхронно
    moex_rates = MoexParser.get_rates()
    binance_rates = BinanceParser.get_rates()

    # Сохраняем в БД через UoW
    with UnitOfWork() as uow:
        repo = CurrencyRepository(uow.session)

        # Фиатные валюты
        for code, rate in moex_rates.items():
            currency = repo.get_by_code(code)
            if currency:
                repo.add_exchange_rate(currency.id, rate, "moex")

        # Криптовалюты
        for symbol, rate in binance_rates.items():
            code = symbol.replace("USDT", "")  # BTCUSDT → BTC
            currency = repo.get_by_code(code)
            if currency and currency.is_crypto:
                repo.add_exchange_rate(currency.id, rate, "binance")

        uow.commit()