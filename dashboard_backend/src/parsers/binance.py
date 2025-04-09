import httpx
from decimal import Decimal


class BinanceParser:
    API_URL = "https://api.binance.com/api/v3/ticker/price"

    @classmethod
    def get_rates(cls) -> dict[str, Decimal]:
        with httpx.Client() as client:
            response = client.get(cls.API_URL)
            data = response.json()

        return {
            item["symbol"]: Decimal(item["price"])
            for item in data
            if item["symbol"].endswith("USDT")  # BTCUSDT, ETHUSDT и т.д.
        }