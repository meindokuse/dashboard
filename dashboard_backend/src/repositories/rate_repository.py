from datetime import datetime
from typing import List

from sqlalchemy import select

from src.data.repository import SQLAlchemyRepository
from src.models.currency import ExchangeRate
from src.schemas.rate import ExchangeRateRead


class RateRepository(SQLAlchemyRepository):
    model = ExchangeRate

    async def get_rates_by_currency_and_period(
        self,
        currency_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> List[ExchangeRateRead]:
        """Получить курсы валюты за указанный период."""
        stmt = (
            select(self.model)
            .filter_by(currency_id=currency_id)  # Фильтр по currency_id
            .where(self.model.timestamp >= start_date)  # Условие начала периода
            .where(self.model.timestamp <= end_date)    # Условие конца периода
            .order_by(self.model.timestamp.asc())       # Сортировка по возрастанию времени
        )

        res = await self.session.execute(stmt)

        res_ready = [row[0].to_read_model() for row in res.all()]

        return res_ready

