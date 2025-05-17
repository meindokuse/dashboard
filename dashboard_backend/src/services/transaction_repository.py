from src.data.unitofwork import IUnitOfWork


class TransactionService:

    def __init__(self,uow:IUnitOfWork):
        self.uow = uow

    async def get_transactions(self,portfolio_id:int,page:int,limit:int):
        """Получение списка тразакций для портфеля"""
        async with self.uow:
            list_transactions = await self.uow.transaction.find_all(page=page,limit=10,portfolio_id=portfolio_id)
            return list_transactions

