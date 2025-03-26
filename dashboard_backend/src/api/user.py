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

    if response_login.is_remember:
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
            secure=False,
            samesite="lax"
        )

    return {
        'user': user
    }
