import statistics
from datetime import datetime
from locale import currency

from fastapi import Depends, APIRouter, HTTPException
from pydantic import BaseModel

from src.api.dependses import UOWDep
from src.services.currency_service import CurrencyService
from src.services.rate_service import RateService

router = APIRouter(
    tags=['rate'],
    prefix='/api/rate',
)

class DateRange(BaseModel):
    start_date: datetime
    end_date: datetime

@router.get("/currencies/{currency_code}/rates/")
async def get_currency_rates(uow: UOWDep, currency_code: str, date_range: DateRange = Depends()):
    """Получить исторические курсы валюты за период с статистикой"""
    currency_service = CurrencyService(uow)
    currency = await currency_service.get_by_code(currency_code)
    if not currency:
        raise HTTPException(status_code=404, detail="Currency not found")

    rate_service = RateService(uow)
    rates = await rate_service.get_rates_by_currency_and_period(currency.id, date_range.start_date, date_range.end_date)

    if not rates:
        raise HTTPException(status_code=404, detail="No rates found for this period")

    rates_data = [{"timestamp": r.timestamp, "rate": float(r.rate)} for r in rates]
    rates_values = [float(r.rate) for r in rates]

    stats = {
        "median": statistics.median(rates_values) if rates_values else None,
        "mean": statistics.mean(rates_values) if rates_values else None,
        "outliers": detect_outliers(rates_values)
    }

    return {"rates": rates_data, "statistics": stats}

@router.get('/last_rates')
async def get_last_rate(uow: UOWDep):
    """Получить последние курсы всех валют"""
    rate_service = RateService(uow)
    currency_service = CurrencyService(uow)

    list_coins = await currency_service.get_currencies()
    list_codes = [c.code for c in list_coins]
    data = dict()

    for code in list_codes:
        currency = await currency_service.get_by_code(code)
        last_rate = await rate_service.get_last_rate(currency.id)
        data[code] = last_rate

    return data

def detect_outliers(values: list[float]) -> list[float]:
    """Обнаружить выбросы в данных (статистическая функция)"""
    if not values:
        return []
    q1 = statistics.quantiles(values, n=4)[0]
    q3 = statistics.quantiles(values, n=4)[2]
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    return [v for v in values if v < lower_bound or v > upper_bound]


