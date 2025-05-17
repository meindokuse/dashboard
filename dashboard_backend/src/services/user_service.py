import uuid
from datetime import timedelta

from fastapi import HTTPException
from fastapi.openapi.models import Response
from redis.asyncio import Redis

from src.data.unitofwork import IUnitOfWork
from src.schemas.user import UserCreate, UserResponseLogin
from src.utils.bcrypt_password import get_password_hash, verify_password


class UserService:
    """Сервис для работы с пользователями: регистрация, аутентификация и управление профилями"""

    def __init__(self, uow: IUnitOfWork):
        """Инициализация сервиса с Unit of Work"""
        self.uow: IUnitOfWork = uow

    async def create_user(self, user: UserCreate):
        """
        Создать нового пользователя с проверкой уникальности email и имени пользователя

        Args:
            user: Данные для создания пользователя

        Returns:
            int: ID созданного пользователя

        Raises:
            HTTPException: 409 если email или имя пользователя уже заняты
        """
        async with self.uow:
            if await self.uow.user.find_one(email=user.email):
                raise HTTPException(status_code=409, detail="Email already registered")
            if await self.uow.user.find_one(username=user.username):
                raise HTTPException(status_code=409, detail="Name already registered")

            user_data = user.model_dump()
            user_data["password_hash"] = get_password_hash(user_data.pop("password"))
            user_id = await self.uow.user.add_one(user_data)
            await self.uow.commit()
            return user_id

    async def authenticate(self, response_login: UserResponseLogin):
        """
        Аутентифицировать пользователя по email и паролю

        Args:
            response_login: Данные для входа (email и пароль)

        Returns:
            User: Аутентифицированный пользователь

        Raises:
            HTTPException: 401 при неверных учетных данных
        """
        email = response_login.email
        password = response_login.password
        async with self.uow:
            user = await self.uow.user.valid_employer(email=email)
            if not user or not verify_password(password, user.password_hash):
                raise HTTPException(status_code=401, detail="Invalid login or password")

            return user

    async def get_user_by_id(self, id: int):
        """
        Получить пользователя по ID

        Args:
            id: ID пользователя

        Returns:
            User | None: Найденный пользователь или None
        """
        async with self.uow:
            user = await self.uow.user.find_one(id=int(id))
            return user

    async def get_user_by_unique_id(self, unique_id: str):
        """
        Получить пользователя по уникальному идентификатору

        Args:
            unique_id: Уникальный строковый идентификатор

        Returns:
            User | None: Найденный пользователь или None
        """
        async with self.uow:
            user = await self.uow.user.find_one(unique_id=unique_id)
            return user