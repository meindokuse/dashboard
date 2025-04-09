
from fastapi import APIRouter

from src.api.dependses import UOWDep
from src.services.currency_service import CurrencyService

router = APIRouter(
    tags=['currencies'],
    prefix='/currencies',
)

@router.get("/currencies/")
async def get_all_currencies(uow:UOWDep):
    currency_service = CurrencyService(uow)
    currencies = await currency_service.get_currencies()
    return currencies
