from src.data.unitofwork import IUnitOfWork
import logging

logger = logging.getLogger(__name__)


class CurrencyService:
    """Сервис для работы с валютами"""

    def __init__(self, uow: IUnitOfWork):
        """Инициализация сервиса с Unit of Work"""
        self.uow = uow

    async def get_currencies(self):
        """
        Получить список валют (первые 10 записей)

        Returns:
            List[Currency]: Список объектов валют
        """
        async with self.uow:
            currencies = await self.uow.currency.find_all(page=1, limit=10)
            return currencies

    async def get_by_code(self, code: str):
        """
        Найти валюту по коду

        Args:
            code: Код валюты (например 'USD')

        Returns:
            Currency | None: Объект валюты или None если не найдена
        """
        async with self.uow:
            currency = await self.uow.currency.find_one(code=code)
            return currency

    async def get_by_code_for_celery(self, code: str):
        """
        Найти валюту по коду (специальная версия для Celery с логированием)

        Args:
            code: Код валюты

        Returns:
            Currency | None: Объект валюты или None если не найдена

        Raises:
            Exception: При ошибках поиска с логированием ошибки
        """
        try:
            logger.debug(f"Searching currency: {code}")
            currency = await self.uow.currency.find_one(code=code)
            if not currency:
                logger.warning(f"Currency not found: {code}")
            return currency
        except Exception as e:
            logger.error(f"Currency lookup failed for {code}: {e}")
            raise