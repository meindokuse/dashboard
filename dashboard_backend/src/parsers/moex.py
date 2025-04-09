import httpx
from decimal import Decimal


class MoexParser:
    API_URL = "https://iss.moex.com/iss/statistics/engines/futures/markets/indicativerates/securities.json"

    @classmethod
    def get_rates(cls) -> dict[str, Decimal]:
        """Возвращает курсы валют с MOEX в формате {code: rate}"""
        with httpx.Client() as client:
            response = client.get(cls.API_URL)
            data = response.json()

        rates = {}
        for item in data["securities"]["data"]:
            code = item[0].split("_")[1]  # Пример: "USD_RUB" → "USD"
            rates[code] = Decimal(str(item[1]))  # Курс

        return rates