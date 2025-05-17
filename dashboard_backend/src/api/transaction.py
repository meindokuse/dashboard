from fastapi import APIRouter

from src.api.dependses import UOWDep
from src.services.transaction_repository import TransactionService

router = APIRouter(
    tags=['transaction'],
    prefix='/transaction',
)


@router.get('/transactions')
async def get_transactions(uow: UOWDep, portfolio_id: int, page: int, limit: int):
    """Получить все транзакции портфеля"""
    t_service = TransactionService(uow)
    result = await t_service.get_transactions(portfolio_id,page,limit)
    return result
