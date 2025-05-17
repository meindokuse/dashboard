
import httpx
from decimal import Decimal
from typing import Dict

class BinanceParser:
    SPOT_API_URL = "https://api.binance.com/api/v3/ticker/price"
    CBR_API_URL = "https://www.cbr-xml-daily.ru/daily_json.js"
    SUPPORTED_PAIRS = {
        "BTCUSDT": "BTC",
        "SOLUSDT": "SOL",
        "ETHUSDT": "ETH",
        "TONUSDT": "TON",
        "USDTUSD": "USDT"
    }

    @classmethod
    def get_rates(cls) -> Dict[str, Decimal]:
        """Возвращает курсы криптовалют к RUB в формате {symbol: price}."""
        try:
            with httpx.Client(timeout=10) as client:
                response = client.get(cls.CBR_API_URL)
                response.raise_for_status()
                usd_rub = Decimal(str(response.json()["Valute"]["USD"]["Value"]))

                response = client.get(cls.SPOT_API_URL)
                response.raise_for_status()
                all_prices = response.json()

                rates = {}
                for item in all_prices:
                    if item["symbol"] in cls.SUPPORTED_PAIRS:
                        currency = cls.SUPPORTED_PAIRS[item["symbol"]]
                        price = Decimal(item["price"]).quantize(Decimal("0.0001"))
                        rates[currency] = usd_rub if currency == "USDT" else (price * usd_rub).quantize(Decimal("0.0001"))

                return rates

        except httpx.RequestError as e:
            return {}
        except Exception as e:
            return {}


