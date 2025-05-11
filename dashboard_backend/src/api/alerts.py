from fastapi import APIRouter

from src.api.dependses import UOWDep
from src.schemas.alerts import AlertCreate, AlertResponse
from src.services.alert_service import AlertService
from src.utils.get_current_user import session_dep


router = APIRouter(
    tags=['alert'],
    prefix='/alert',
)


@router.post('/create_alert')
async def create_alert(alert:AlertResponse,user_id:session_dep,uow:UOWDep):
    alert_create = AlertCreate(
        
    )
    alert_service = AlertService(uow)
    id = await alert_service.create_alert(alert_create)
    return id
