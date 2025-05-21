
from fastapi import APIRouter

from src.api.dependses import UOWDep
from src.schemas.alerts import AlertCreate, AlertResponse, AlertUpdate
from src.services.alert_service import AlertService
from src.utils.get_current_user import session_dep


router = APIRouter(
    tags=['alert'],
    prefix='/api/alert',
)


@router.post('/create_alert')
async def create_alert(alert: AlertResponse, user_id: session_dep, uow: UOWDep):
    """
    Создает новое уведомление для пользователя.
    Требует данных о валюте, времени и канале уведомления.
    """
    alert_create = AlertCreate(
        user_id=int(user_id),
        currency_id=alert.currency_id,
        notification_time=alert.notification_time,
        notification_channel=alert.notification_channel,
    )
    alert_service = AlertService(uow)
    id = await alert_service.create_alert(alert_create)
    return id


@router.put('/update_alert')
async def update_alert(alert: AlertUpdate, uow: UOWDep):
    """
    Обновляет существующее уведомление по его ID.
    Принимает новые параметры уведомления.
    """
    alert_service = AlertService(uow)
    id = await alert_service.update_alert(alert)
    return id


@router.get('/alerts')
async def get_alerts(user_id: session_dep, uow: UOWDep):
    """
    Возвращает все уведомления текущего пользователя.
    Пользователь определяется автоматически из сессии.
    """
    alert_service = AlertService(uow)
    alert = await alert_service.find_alert_by_user_id(int(user_id))
    return alert

