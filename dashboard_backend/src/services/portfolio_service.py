from fastapi import HTTPException
from src.data.unitofwork import IUnitOfWork
from src.schemas.portfolio import PortfolioCreate, PortfolioPositionCreate, PortfolioPositionUpdateResponse
from src.schemas.transaction import TransactionCreate
from decimal import Decimal
from typing import Dict, List, Any


class PortfolioService:
    """Сервис для управления портфелями активов и позициями"""

    def __init__(self, uow: IUnitOfWork):
        self.uow = uow

    async def get_portfolios(self, user_id: int, page: int, limit: int):
        """Получить список портфелей пользователя с пагинацией"""
        async with self.uow:
            portfolios = await self.uow.portfolio.find_all(user_id=user_id, page=page, limit=limit)
            return portfolios

    async def get_portfolio_positions(self, portfolio_id: int):
        """Получить все позиции портфеля"""
        async with self.uow:
            portfolio_positions = await self.uow.portfolio_position.find_all(page=1, limit=4, portfolio_id=portfolio_id)
            return portfolio_positions

    async def calculate_profits(self, portfolio_id: int) -> List[Dict]:
        """Рассчитать прибыль по каждой позиции портфеля"""
        async with self.uow:
            positions = await self.get_portfolio_positions(portfolio_id)
            transactions = await self.uow.transaction.find_all(page=1, limit=0, portfolio_id=portfolio_id)
            current_rates = await self._get_current_rates([pos.currency_id for pos in positions])
            return await self._calculate_profits(positions, transactions, current_rates)

    async def calculate_portfolio_summary(self, portfolio_id: int) -> Dict[str, Any]:
        """Сформировать сводную аналитику по портфелю"""
        async with self.uow:
            positions = await self.get_portfolio_positions(portfolio_id)
            transactions = await self.uow.transaction.find_all(page=1, limit=0, portfolio_id=portfolio_id)
            current_rates = await self._get_current_rates([pos.currency_id for pos in positions])

            position_results = []
            total_cost = Decimal("0")
            total_current = Decimal("0")

            for pos in positions:
                currency = await self.uow.currency.find_one(id=pos.currency_id)
                current_rate = current_rates.get(pos.currency_id, Decimal("0"))
                fifo_cost = Decimal("0")
                remaining = Decimal(str(pos.amount))

                for tx in sorted([t for t in transactions
                                  if t.currency_id == pos.currency_id and t.type == "buy"],
                                 key=lambda x: x.timestamp):
                    if remaining <= 0: break
                    used = min(Decimal(str(tx.amount)), remaining)
                    fifo_cost += used * Decimal(str(tx.rate))
                    remaining -= used

                current_value = (Decimal(str(pos.amount)) * current_rate).quantize(Decimal("0.01"))
                profit = current_value - fifo_cost
                profit_percent = (profit / fifo_cost * 100).quantize(Decimal("0.01")) if fifo_cost > 0 else Decimal("0")

                position_results.append({
                    "currency": currency.code,
                    "amount": Decimal(str(pos.amount)),
                    "current_value": current_value,
                    "profit_percent": profit_percent
                })

                total_cost += fifo_cost
                total_current += current_value

            total_profit = total_current - total_cost
            total_profit_percent = (total_profit / total_cost * 100).quantize(
                Decimal("0.01")) if total_cost > 0 else Decimal("0")

            return {
                "positions": position_results,
                "summary": {
                    "total_invested": total_cost.quantize(Decimal("0.01")),
                    "total_current_value": total_current.quantize(Decimal("0.01")),
                    "total_profit": total_profit.quantize(Decimal("0.01")),
                    "total_profit_percent": total_profit_percent,
                    "currencies_count": len(position_results)
                }
            }

    async def _get_current_rates(self, currency_ids: List[int]) -> Dict[int, Decimal]:
        """Получить актуальные курсы валют"""
        rates = {}
        for currency_id in currency_ids:
            rate = await self.uow.rate.get_last_rate(currency_id)
            rates[currency_id] = Decimal(str(rate)) if rate else Decimal("0")
        return rates

    async def _calculate_profits(self, positions, transactions, current_rates) -> List[Dict]:
        """Рассчитать прибыль с форматированием результатов"""
        results = []
        for pos in positions:
            currency = await self.uow.currency.find_one(id=pos.currency_id)
            current_rate = current_rates.get(pos.currency_id, Decimal("0"))
            fifo_cost = Decimal("0")
            remaining_amount = Decimal(str(pos.amount))

            for tx in sorted([t for t in transactions if t.currency_id == pos.currency_id and t.type == "buy"],
                             key=lambda x: x.timestamp):
                if remaining_amount <= 0:
                    break
                used_amount = min(Decimal(str(tx.amount)), remaining_amount)
                fifo_cost += used_amount * Decimal(str(tx.rate))
                remaining_amount -= used_amount

            current_value = (Decimal(str(pos.amount)) * current_rate).quantize(Decimal("0.01"))
            profit = (current_value - fifo_cost).quantize(Decimal("0.01"))
            profit_percent = (profit / fifo_cost * 100).quantize(Decimal("0.01")) if fifo_cost > 0 else Decimal("0")

            profit_str = f"{abs(profit)} RUB" if profit == 0 else f"{profit} RUB"
            percent_sign = "+" if profit > 0 else "" if profit == 0 else "-"
            profit_percent_str = f"{percent_sign}{abs(profit_percent)}%"

            results.append({
                "currency": currency.code,
                "current_value": current_value,
                "profit": profit_str,
                "profit_percent": profit_percent_str
            })
        return results

    async def create_portfolio(self, portfolio: PortfolioCreate):
        """Создать новый портфель"""
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
        """Добавить позицию в портфель с проверкой баланса"""
        async with self.uow:
            rate = await self.uow.rate.get_last_rate(portfolio.currency_id)
            if not rate:
                raise HTTPException(status_code=400, detail="Currency rate not available")

            user = await self.uow.user.find_one(id=user_id)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            total_cost = portfolio.amount * portfolio.purchase_rate
            if user.balance < total_cost:
                raise HTTPException(
                    status_code=402,
                    detail=f"Insufficient funds. Need {total_cost}, have {user.balance}"
                )

            portfolio_data = portfolio.model_dump()
            portfolio_id = await self.uow.portfolio_position.add_one(portfolio_data)
            transaction_data = transaction.model_dump()
            transaction_id = await self.uow.transaction.add_one(transaction_data)
            new_balance = user.balance - total_cost
            await self.uow.user.update_balance(id=user_id, new_balance=new_balance)
            await self.uow.commit()
            return portfolio_id

    async def update_portfolio_position(self, position: PortfolioPositionUpdateResponse, user_id: int):
        """Обновить позицию портфеля (покупка/продажа)"""
        async with self.uow:
            current_position = await self.uow.portfolio_position.find_one(id=position.id)
            if not current_position:
                raise HTTPException(status_code=404, detail="Position not found")

            rate = await self.uow.rate.get_last_rate(current_position.currency_id)
            if not rate:
                raise HTTPException(status_code=400, detail="Currency rate not available")

            user = await self.uow.user.find_one(id=user_id)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            transaction_amount = position.amount * rate

            if position.type == 'buy':
                if user.balance < transaction_amount:
                    raise HTTPException(status_code=402, detail="Insufficient funds")
                updated_data = {'amount': current_position.amount + position.amount, 'purchase_rate': rate}
                new_balance = user.balance - transaction_amount
            elif position.type == 'sell':
                if current_position.amount < position.amount:
                    raise HTTPException(status_code=402, detail="Not enough currency")
                updated_data = {'amount': current_position.amount - position.amount}
                new_balance = user.balance + transaction_amount
            else:
                raise HTTPException(status_code=400, detail="Invalid transaction type")

            await self.uow.portfolio_position.edit_one(position.id, updated_data)
            await self.uow.user.update_balance(user_id, new_balance)
            transaction_data = {
                'user_id': user_id,
                'currency_id': current_position.currency_id,
                'type': position.type,
                'amount': position.amount,
                'rate': rate,
                'portfolio_id': current_position.portfolio_id
            }
            await self.uow.transaction.add_one(transaction_data)
            await self.uow.commit()
            return position.id

    async def delete_portfolio_position(self,portfolio_id: int, user_id: int):
        async with self.uow:
            data = await self.calculate_portfolio_summary(portfolio_id)
            total = data['summary']['total_current_value']
            await self.uow.portfolio.delete_one(id=portfolio_id)
            
            user = await self.uow.user.find_one(id=user_id)
            new_balance = user.balance + float(total)
            await self.uow.user.update_balance(user_id, new_balance)
            await self.uow.commit()
