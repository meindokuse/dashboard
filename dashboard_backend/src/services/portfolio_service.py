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

    async def create_portfolio_position(
        self,
        transaction: TransactionCreate,
        portfolio: PortfolioPositionCreate,
        user_id: int
        ):
        async with self.uow:
            try:
                # 1. Получаем текущий курс валюты
                rate = await self.uow.rate.get_last_rate(portfolio.currency_id)
                if not rate:
                    raise HTTPException(status_code=400, detail="Currency rate not available")

                # 2. Получаем пользователя
                user = await self.uow.user.find_one(id=user_id)
                if not user:
                    raise HTTPException(status_code=404, detail="User not found")

                # 3. Рассчитываем сумму в базовой валюте (рублях/долларах)
                total_cost = portfolio.amount * portfolio.purchase_rate

                # 4. Проверяем достаточно ли средств
                if user.balance < total_cost:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Insufficient funds. Need {total_cost}, have {user.balance}"
                    )

                # 5. Создаем запись о позиции
                portfolio_data = portfolio.model_dump()
                portfolio_id = await self.uow.portfolio_position.add_one(portfolio_data)

                # 6. Создаем транзакцию
                transaction_data = transaction.model_dump()
                transaction_id = await self.uow.transaction.add_one(transaction_data)

                # 7. Обновляем баланс пользователя
                new_balance = user.balance - total_cost
                await self.uow.user.update_balance(id=user_id, new_balance=new_balance)

                # 8. Фиксируем изменения
                await self.uow.commit()
                return portfolio_id

            except Exception as e:
                await self.uow.rollback()
                raise HTTPException(status_code=500, detail=str(e))
    async def update_portfolio_position(self, position: PortfolioPositionUpdateResponse, user_id: int):
        async with self.uow:
            # 1. Получаем текущую позицию
            current_position = await self.uow.portfolio_position.find_one(id=position.id)
            if not current_position:
                raise HTTPException(status_code=404, detail="Position not found")
            
            # 3. Получаем текущий курс валюты
            rate = await self.uow.rate.get_last_rate(position.currency_id)
            if not rate:
                raise HTTPException(status_code=400, detail="Currency rate not available")
            
            # 4. Получаем пользователя
            user = await self.uow.user.find_one(id=user_id)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # 5. Рассчитываем изменение баланса
            transaction_amount = position.amount * rate.rate
            
            # 6. Обрабатываем покупку/продажу
            if position.type == 'buy':
                # Проверяем достаточно ли средств
                if user.balance < transaction_amount:
                    raise HTTPException(status_code=400, detail="Insufficient funds")
                
                # Обновляем позицию (увеличиваем количество)
                updated_data = {
                    'amount': current_position.amount + position.amount,
                    'purchase_rate': rate.rate  # обновляем курс покупки
                }
                
                # Уменьшаем баланс
                new_balance = user.balance - transaction_amount
            
            elif position.type == 'sell':
                # Проверяем достаточно ли валюты
                if current_position.amount < position.amount:
                    raise HTTPException(status_code=400, detail="Not enough currency")
                
                # Обновляем позицию (уменьшаем количество)
                updated_data = {
                    'amount': current_position.amount - position.amount
                }
                
                # Увеличиваем баланс
                new_balance = user.balance + transaction_amount
            
            else:
                raise HTTPException(status_code=400, detail="Invalid transaction type")
            
            # 7. Обновляем позицию
            await self.uow.portfolio_position.edit_one(position.id, updated_data)
            
            # 8. Обновляем баланс пользователя
            await self.uow.user.update_balance(user_id, new_balance)
            
            # 9. Создаем запись о транзакции
            transaction_data = {
                'user_id': user_id,
                'currency_id': position.currency_id,
                'type': position.type,
                'amount': position.amount,
                'rate': rate.rate,
                'portfolio_id': position.portfolio_id
            }
            await self.uow.transaction.add_one(transaction_data)
            
            await self.uow.commit()
            return position.id
