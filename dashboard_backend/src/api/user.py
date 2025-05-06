import json
import uuid
from datetime import timedelta

from fastapi import APIRouter, Depends
from redis.asyncio import Redis
from sqlalchemy.testing.suite.test_reflection import users

from src.tasks.auth_tasks import save_session_to_redis

from src.api.dependses import UOWDep
from src.schemas.user import UserCreate, UserResponseLogin
from src.services.user_service import UserService
from fastapi import Request, Response

from src.utils.get_current_user import session_dep

router = APIRouter(
    tags=['user'],
    prefix='/user',
)


@router.post('/register')
async def register(user: UserCreate, uow: UOWDep):
    user_service = UserService(uow)
    user_id = await user_service.create_user(user)
    return {
        'user_id': user_id,
    }


@router.post('/login')
async def login(
        request: Request,
        response: Response,
        response_login: UserResponseLogin,
        uow: UOWDep,
):
    user_service = UserService(uow)
    user = await user_service.authenticate(response_login)

    if user and response_login.is_remember:
        session_id = str(uuid.uuid4())

        # Запуск в фоне без ожидания!
        save_session_to_redis.delay(
            user_id=str(user.id),
            user_ip=request.client.host,
            is_remember=response_login.is_remember,
            session_id=session_id,
        )

        # установка куки
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            max_age=30 * 24 * 3600,
            secure=False,  # Для локального тестирования через туннель
            samesite="none"  # Обязательно для кросс-доменных запросов
        )

    return {
        'user': user
    }

@router.post('/profile')
async def get_user_profile(user_id: session_dep,uow:UOWDep):
    user_service = UserService(uow)
    user = await user_service.get_user_by_id(user_id)
    return {"user": user}



