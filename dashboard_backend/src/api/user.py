import json
import uuid

from fastapi import APIRouter,HTTPException

from src.tasks.auth_tasks import save_session_to_redis

from src.api.dependses import UOWDep
from src.schemas.user import UserCreate, UserResponseLogin
from src.services.user_service import UserService
from fastapi import Request, Response

from src.utils.get_current_user import session_dep

router = APIRouter(
    tags=['user'],
    prefix='/api/user',
)


@router.post('/register')
async def register(user: UserCreate, uow: UOWDep):
    """Зарегистрировать нового пользователя"""
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
    """Аутентификация пользователя и создание сессии"""
    user_service = UserService(uow)
    user = await user_service.authenticate(response_login)

    if not user:
        raise HTTPException(status_code=403, detail="Неверный email или пароль")

    session_id = str(uuid.uuid4())

    save_session_to_redis.delay(
        user_id=str(user.id),
        user_ip=request.client.host,
        is_remember=response_login.is_remember,
        session_id=session_id,
    )

    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        max_age=30 * 24 * 3600,
        secure=False,
        samesite="lax",
    )

    return {
        "user": user,
        "session_id": session_id,
    }

@router.post('/profile')
async def get_user_profile(user_id: session_dep, uow: UOWDep, request: Request):
    """Получить профиль пользователя по сессии"""
    print("Пришедшие куки:", request.cookies)
    user_service = UserService(uow)
    user = await user_service.get_user_by_id(user_id)
    return {"user": user}

@router.post('/verify_id')
async def verify_id(unique_id: str, uow: UOWDep):
    """Верифицировать пользователя по уникальному ID"""
    user_service = UserService(uow)
    user = await user_service.get_user_by_unique_id(unique_id)
    if not user:
        raise HTTPException(status_code=401, detail='Not Valid')
    return {"user": user}

