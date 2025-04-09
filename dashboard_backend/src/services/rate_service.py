from datetime import datetime
from locale import currency
from typing import List

from src.data.unitofwork import IUnitOfWork
from src.schemas.rate import ExchangeRateRead


class RateService:
    def __init__(self,uow:IUnitOfWork):
        self.uow = uow

    async def get_rates_by_currency_and_period(
            self,
            currency_id: int,
            start_date: datetime,
            end_date: datetime
    ) -> List[ExchangeRateRead]:
        async with self.uow:
            rates = await self.uow.rate.get_rates_by_currency_and_period(currency_id, start_date, end_date)
            return rates









