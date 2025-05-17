from datetime import timezone, datetime
from locale import currency

from fastapi import APIRouter

from src.api.dependses import UOWDep
from src.database.cache import redis_pool
from src.schemas.alerts import AlertPortfolioCreate, AlertPortfolioUpdate, AlertPortfolioResponse
from src.schemas.portfolio import PortfolioCreate, PortfolioPositionCreateResponse, PortfolioPositionCreate, \
    PortfolioPositionUpdateResponse
from src.schemas.transaction import TransactionCreate
from src.services.portfolio_alert_service import PortfolioAlertService
from src.services.portfolio_service import PortfolioService
from src.services.rate_service import RateService
from src.utils.get_current_user import session_dep

router = APIRouter(
    tags=['portfolio'],
    prefix='/portfolio',
)


@router.get('/portfolios')
async def portfolios(page: int, limit: int, user_id: session_dep, uow: UOWDep):
    """Получить список портфелей пользователя с пагинацией"""
    portfolio_service = PortfolioService(uow)
    list_portfolios = await portfolio_service.get_portfolios(int(user_id), page, limit)
    return list_portfolios

@router.post('/create')
async def create_portfolio(name: str, user_id: session_dep, uow: UOWDep):
    """Создать новый портфель для пользователя"""
    portfolio = PortfolioCreate(
        user_id=int(user_id),
        name=name,
    )
    portfolio_service = PortfolioService(uow)
    id = await portfolio_service.create_portfolio(portfolio)
    return id

@router.post('/create_position')
async def create_portfolio_position(portfolio: PortfolioPositionCreateResponse, uow: UOWDep, user_id: session_dep):
    """Добавить позицию в портфель и создать транзакцию покупки"""
    portfolio_service = PortfolioService(uow)
    rate_service = RateService(uow)

    purchase_rate = await rate_service.get_last_rate(portfolio.currency_id)

    portfolio_create = PortfolioPositionCreate(
        portfolio_id=portfolio.portfolio_id,
        currency_id=portfolio.currency_id,
        amount=portfolio.amount,
        purchase_rate=purchase_rate,
    )

    transaction = TransactionCreate(
        user_id=int(user_id),
        currency_id=portfolio.currency_id,
        type='buy',
        amount=portfolio.amount,
        rate=purchase_rate,
        portfolio_id=portfolio.portfolio_id,
    )

    id = await portfolio_service.create_portfolio_position(transaction, portfolio_create, int(user_id))
    return id

@router.put('/update_position')
async def update_position(portfolio_update: PortfolioPositionUpdateResponse, uow: UOWDep, user_id: session_dep):
    """Обновить данные позиции в портфеле"""
    portfolio_service = PortfolioService(uow)
    id = await portfolio_service.update_portfolio_position(portfolio_update, int(user_id))
    return id

@router.get('/{portfolio_id}/portfolio_positions')
async def get_portfolio_positions(uow: UOWDep, portfolio_id: int):
    """Получить все позиции конкретного портфеля"""
    portfolio_service = PortfolioService(uow)
    portfolio_positions = await portfolio_service.get_portfolio_positions(portfolio_id)
    return portfolio_positions

@router.get('/position_profit')
async def get_position_profit(uow: UOWDep, portfolio_id: int):
    """Рассчитать прибыль по позициям портфеля"""
    portfolio_service = PortfolioService(uow)
    profit = await portfolio_service.calculate_profits(portfolio_id)
    return profit

@router.get('/portfolio_profit')
async def get_portfolio_profit(uow: UOWDep, portfolio_id: int):
    """Рассчитать общую прибыль портфеля"""
    portfolio_service = PortfolioService(uow)
    profit = await portfolio_service.calculate_portfolio_summary(portfolio_id)
    return profit

@router.post('/create_alert')
async def create_alert(uow: UOWDep, alert: AlertPortfolioResponse, user_id: session_dep):
    """Создать уведомление для портфеля"""
    alert_create = AlertPortfolioCreate(
        user_id=int(user_id),
        portfolio_id=int(alert.portfolio_id),
        threshold=alert.threshold,
        notification_channel=alert.notification_channel,
    )
    portfolio_alert_service = PortfolioAlertService(uow)
    id = await portfolio_alert_service.create_alert(alert_create)
    return id

@router.put('/update_alert')
async def update_alert(uow: UOWDep, alert: AlertPortfolioUpdate):
    """Обновить параметры уведомления портфеля"""
    portfolio_alert_service = PortfolioAlertService(uow)
    id = await portfolio_alert_service.update_alert(alert)
    return id

@router.get('/alerts')
async def get_alerts(uow: UOWDep, portfolio_id: int):
    """Получить уведомления для портфеля"""
    portfolio_alert_service = PortfolioAlertService(uow)
    alert = await portfolio_alert_service.find_alert_by_portfolio_id(portfolio_id)
    return alert



