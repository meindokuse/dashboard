from locale import currency

from fastapi import APIRouter

from src.api.dependses import UOWDep
from src.schemas.portfolio import PortfolioCreate, PortfolioPositionCreateResponse, PortfolioPositionCreate, \
    PortfolioPositionUpdateResponse
from src.schemas.transaction import TransactionCreate
from src.services.portfolio_service import PortfolioService
from src.services.rate_service import RateService
from src.utils.get_current_user import session_dep

router = APIRouter(
    tags=['portfolio'],
    prefix='/portfolio',
)


@router.get('/portfolios')
async def portfolios(page:int,limit:int,user_id: session_dep, uow: UOWDep):
    portfolio_service = PortfolioService(uow)
    list_portfolios = await portfolio_service.get_portfolios(int(user_id),page,limit)
    return list_portfolios


@router.post('/create')
async def create_portfolio(name:str,user_id:session_dep, uow: UOWDep):
    portfolio = PortfolioCreate(
        user_id=int(user_id),
        name=name,
    )
    portfolio_service = PortfolioService(uow)
    id = await portfolio_service.create_portfolio(portfolio)
    return id

@router.post('/create_position')
async def create_portfolio_position(portfolio: PortfolioPositionCreateResponse, uow: UOWDep, user_id: session_dep):
    portfolio_service = PortfolioService(uow)
    rate_service = RateService(uow)

    purchase_rate = await rate_service.get_last_rate(portfolio.currency_id)

    portfolio_create = PortfolioPositionCreate(
        portfolio_id=portfolio.portfolio_id,
        currency_id=portfolio.currency_id,
        amount=portfolio.amount,
        purchase_rate = purchase_rate.rate,
    )

    transaction = TransactionCreate(
        user_id=int(user_id),
        currency_id=portfolio.currency_id,
        type = 'buy',
        amount = portfolio.amount,
        rate = purchase_rate.rate,
        portfolio_id = portfolio.portfolio_id,
    )

    id = await portfolio_service.create_portfolio_position(transaction,portfolio_create,int(user_id))
    return id

@router.put('/update_position')
async def update_position(portfolio_update: PortfolioPositionUpdateResponse, uow: UOWDep, user_id: session_dep):
    portfolio_service = PortfolioService(uow)

    id = await portfolio_service.update_portfolio_position(portfolio_update, int(user_id))
    return id









