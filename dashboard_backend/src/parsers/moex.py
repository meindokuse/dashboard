import httpx
from decimal import Decimal

class MoexParser:
    API_URL = "https://iss.moex.com/iss/engines/currency/markets/selt/boards/CETS/securities.json"

    @classmethod
    def get_rates(cls) -> dict[str, Decimal]:
        """Возвращает спотовые курсы валют с MOEX в формате {code: rate}."""
        with httpx.Client() as client:
            response = client.get(cls.API_URL)
            response.raise_for_status()
            data = response.json()

        rates = {}
        for item in data["securities"]["data"]:
            instrument = item[0]  # SECID
            prev_price = item[14]  # PREVPRICE
            currency_id = item[16]  # CURRENCYID

            # Пропускаем, если цена отсутствует или не число
            if prev_price is None or not isinstance(prev_price, (int, float)):
                continue

            # Фильтруем: только RUB и спотовые курсы (TOD, SPT, 000000TOD), исключаем свопы
            if (currency_id == "RUB" and
                (instrument.endswith("_TOD") or instrument.endswith("_SPT") or "000000TOD" in instrument) and
                "TODTOM" not in instrument and "TOM" not in instrument.split("_")[1:]):
                # Определяем код валюты
                if instrument.startswith("USD") or "USD000000TOD" in instrument:
                    code = "USD"
                elif instrument.startswith("EUR") or "EUR000TODTOM" in instrument:
                    code = "EUR"
                elif instrument.startswith("CNY") or "CNY000000TOD" in instrument:
                    code = "CNY"
                else:
                    continue

                # Записываем курс (TOD и 000000TOD приоритетнее SPT)
                if code not in rates or instrument.endswith("_TOD") or "000000TOD" in instrument:
                    rates[code] = Decimal(str(prev_price))

        return rates

# Тест
if __name__ == "__main__":
    rates = MoexParser.get_rates()
    print("Final rates:", rates)