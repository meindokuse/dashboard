import uuid
from datetime import timedelta

from fastapi import HTTPException
from fastapi.openapi.models import Response
from redis.asyncio import Redis

from src.data.unitofwork import IUnitOfWork
from src.schemas.user import UserCreate, UserResponseLogin
from src.utils.bcrypt_password import get_password_hash, verify_password


class UserService:
    def __init__(self, uow: IUnitOfWork):
        self.uow: IUnitOfWork = uow

    async def create_user(self, user: UserCreate):
        async with self.uow:

            # Проверка существования email и имени
            if await self.uow.user.find_one(email=user.email):
                raise HTTPException(status_code=409, detail="Email already registered")
            if await self.uow.user.find_one(username=user.username):
                raise HTTPException(status_code=409, detail="Name already registered")

            # Хеширование пароля и сохранение
            user_data = user.model_dump()
            user_data["password_hash"] = get_password_hash(user_data.pop("password"))
            user_id = await self.uow.user.add_one(user_data)
            await self.uow.commit()  # Успешное завершение транзакции
            return user_id

    async def authenticate(self, response_login: UserResponseLogin):
        email = response_login.email
        password = response_login.password
        async with self.uow:
            user = await self.uow.user.valid_employer(email=email)
            if not user or not verify_password(password, user.password_hash):
                raise HTTPException(status_code=401, detail="Invalid login or password")

            return user

    async def get_user_by_id(self, id: int):
        async with self.uow:
            user = await self.uow.user.find_one(id=id)
            return user
