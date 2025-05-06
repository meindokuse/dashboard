from fastapi import HTTPException

from src.data.unitofwork import IUnitOfWork
from src.schemas.portfolio import PortfolioCreate, PortfolioPositionCreate, PortfolioPositionUpdateResponse
from src.schemas.transaction import TransactionCreate


class PortfolioService:
    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    async def get_portfolios(self,user_id:int,page:int,limit:int):
        async with self.uow:
            portfolios  = await self.uow.portfolio.find_all(user_id=user_id,page=page,limit=limit)
            return portfolios

    async def create_portfolio(self,portfolio:PortfolioCreate):
        data = portfolio.model_dump()
        async with self.uow:
            id = await self.uow.portfolio.add_one(data)
            await self.uow.commit()
            return id

    async def create_portfolio_position(self,transaction: TransactionCreate,portfolio:PortfolioPositionCreate,user_id:int):
        data_portfolio = portfolio.model_dump()
        data_transaction = transaction.model_dump()
        async with self.uow:
            transaction_id = await self.uow.transaction.add_one(data_transaction)
            portfolio_id = await self.uow.portfolio_position.add_one(data_portfolio)
            user = await self.uow.user.find_one(id=user_id)
            new_balance = user.balance - data_portfolio['amount']
            b_id = await self.uow.user.update_balance(id=user_id, new_balance=new_balance)
            if b_id and portfolio_id and transaction_id:
                await self.uow.commit()
            else:
                raise HTTPException(status_code=500, detail='Unexpected error')
    async def update_portfolio_position(self,position:PortfolioPositionUpdateResponse,user_id:int):
        data = position.model_dump()
        async with self.uow:
            portfolio_id = await self.uow.portfolio_position.edit_one(data['id'],data)
            user = await self.uow.user.find_one(id=user_id)
            new_balance = user.balance - data['amount']
            b_id = await self.uow.user.update_balance(id=user_id, new_balance=new_balance)
            if b_id and portfolio_id:
                await self.uow.commit()
            else:
                raise HTTPException(status_code=500, detail='Unexpected error')
