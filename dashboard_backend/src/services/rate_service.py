from datetime import datetime
from locale import currency
from typing import List

from src.data.unitofwork import IUnitOfWork
from src.schemas.rate import ExchangeRateRead, ExchangeRateCreate
import logging

logger = logging.getLogger(__name__)


class RateService:
    """Сервис для работы с курсами валют"""

    def __init__(self, uow: IUnitOfWork):
        """Инициализация сервиса с Unit of Work"""
        self.uow = uow

    async def get_rates_by_currency_and_period(
            self,
            currency_id: int,
            start_date: datetime,
            end_date: datetime
    ) -> List[ExchangeRateRead]:
        """
        Получить исторические курсы валюты за период

        Args:
            currency_id: ID валюты
            start_date: Начальная дата периода
            end_date: Конечная дата периода

        Returns:
            Список курсов валюты за указанный период
        """
        async with self.uow:
            rates = await self.uow.rate.get_rates_by_currency_and_period(currency_id, start_date, end_date)
            return rates

    async def add_rate(self, new_rate: ExchangeRateCreate):
        """
        Добавить новый курс валюты

        Args:
            new_rate: Данные нового курса

        Returns:
            ID добавленного курса
        """
        async with self.uow:
            data = new_rate.model_dump()
            id = await self.uow.rate.add_one(data)
            await self.uow.commit()
            return id

    async def add_rate_for_celery(self, new_rate: ExchangeRateCreate):
        """
        Добавить курс валюты (версия для Celery с логированием)

        Args:
            new_rate: Данные нового курса

        Returns:
            ID добавленного курса

        Raises:
            Exception: В случае ошибки с логированием
        """
        try:
            logger.debug(f"Adding rate: {new_rate}")
            data = new_rate.model_dump()
            rate_id = await self.uow.rate.add_one(data)
            await self.uow.commit()
            logger.info(f"Rate added successfully: {rate_id}")
            return rate_id
        except Exception as e:
            logger.error(f"Failed to add rate: {e}")
            await self.uow.rollback()
            raise

    async def get_last_rate(self, currency_id: int):
        """
        Получить последний курс валюты

        Args:
            currency_id: ID валюты

        Returns:
            Последний зарегистрированный курс или None
        """
        async with self.uow:
            rate = await self.uow.rate.get_last_rate(currency_id)
            return rate

    async def get_last_rate_for_celery(self, currency_id: int):
        """
        Получить последний курс валюты (версия для Celery)

        Args:
            currency_id: ID валюты

        Returns:
            Последний зарегистрированный курс или None
        """
        rate = await self.uow.rate.get_last_rate(currency_id)
        return rate
