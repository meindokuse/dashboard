from datetime import datetime
from locale import currency
from typing import List

from src.data.unitofwork import IUnitOfWork
from src.schemas.rate import ExchangeRateRead, ExchangeRateCreate


class RateService:
    def __init__(self, uow: IUnitOfWork):
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

    async def add_rate(self, new_rate: ExchangeRateCreate):
        async with self.uow:
            data = new_rate.model_dump()
            id = await self.uow.rate.add_one(data)
            await self.uow.commit()
            return id

    async def get_last_rate(self, currency_id: int):
        async with self.uow:
            rate = await self.uow.rate.get_last_rate(currency_id)
            return rate
