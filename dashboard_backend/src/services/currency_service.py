from src.data.unitofwork import IUnitOfWork
import logging

logger = logging.getLogger(__name__)


class CurrencyService:
    def __init__(self,uow:IUnitOfWork):
        self.uow = uow

    async def get_currencies(self):
        async with self.uow:
            currencies = await self.uow.currency.find_all(page=1,limit=10)
            return currencies

    async def get_by_code(self,code:str):
        async with self.uow:
            currency = await self.uow.currency.find_one(code=code)
            return currency
    async def get_by_code_for_celery(self,code:str):
        try:
            logger.debug(f"Searching currency: {code}")
            currency = await self.uow.currency.find_one(code=code)
            if not currency:
                logger.warning(f"Currency not found: {code}")
            return currency
        except Exception as e:
            logger.error(f"Currency lookup failed for {code}: {e}")
            raise