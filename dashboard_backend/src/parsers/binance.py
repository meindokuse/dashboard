import httpx
from decimal import Decimal

class BinanceParser:
    API_URL = "https://api.binance.com/api/v3/ticker/price"

    @classmethod
    def get_rates(cls) -> dict[str, Decimal]:
        with httpx.Client() as client:
            response = client.get(cls.API_URL)
            response.raise_for_status()  # Проверка на ошибки HTTP
            data = response.json()

        return {
            item["symbol"]: Decimal(item["price"])
            for item in data
            if item["symbol"] == "BTCUSDT"  # Оставляем только BTC/USDT
        }
