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
    prefix='/rate',
)

class DateRange(BaseModel):
    start_date: datetime
    end_date: datetime

@router.get("/currencies/{currency_code}/rates/")
async def get_currency_rates(uow:UOWDep,currency_code: str, date_range: DateRange = Depends()):
    # Проверяем, существует ли валюта

    currency_service = CurrencyService(uow)

    currency = await currency_service.get_by_code(currency_code)
    if not currency:
        raise HTTPException(status_code=404, detail="Currency not found")

    rate_service = RateService(uow)
    rates = await rate_service.get_rates_by_currency_and_period(currency.id, date_range.start_date, date_range.end_date)

    if not rates:
        raise HTTPException(status_code=404, detail="No rates found for this period")

        # Преобразуем данные в список для фронта
    rates_data = [{"timestamp": r.timestamp, "rate": float(r.rate)} for r in rates]
    rates_values = [float(r.rate) for r in rates]

    # Вычисляем статистику
    stats = {
        "median": statistics.median(rates_values) if rates_values else None,
        "mean": statistics.mean(rates_values) if rates_values else None,
        "outliers": detect_outliers(rates_values)
    }

    return {"rates": rates_data, "statistics": stats}

def detect_outliers(values: list[float]) -> list[float]:
    if not values:
        return []
    q1 = statistics.quantiles(values, n=4)[0]
    q3 = statistics.quantiles(values, n=4)[2]
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    return [v for v in values if v < lower_bound or v > upper_bound]



