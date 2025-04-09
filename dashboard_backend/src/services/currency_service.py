from src.data.unitofwork import IUnitOfWork


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