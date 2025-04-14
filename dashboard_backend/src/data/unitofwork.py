from abc import ABC, abstractmethod
from typing import Type

from src.database.database import async_session_maker
from src.repositories.currency_repository import CurrencyRepository
from src.repositories.rate_repository import RateRepository
from src.repositories.user_repository import UserRepository


# https://github1s.com/cosmicpython/code/tree/chapter_06_uow
class IUnitOfWork(ABC):
    user: UserRepository
    currency: CurrencyRepository
    rate: RateRepository


    @abstractmethod
    def __init__(self):
        ...

    @abstractmethod
    async def __aenter__(self):
        ...

    @abstractmethod
    async def __aexit__(self, *args):
        ...

    @abstractmethod
    async def commit(self):
        ...

    @abstractmethod
    async def rollback(self):
        ...


class UnitOfWork(IUnitOfWork):
    def __init__(self):
        self.session_factory = async_session_maker

    async def __aenter__(self):
        self.session = self.session_factory()
        self.user = UserRepository(self.session)
        self.currency = CurrencyRepository(self.session)
        self.rate = RateRepository(self.session)
        return self  # Возвращаем себя для использования в `async with`

    async def __aexit__(self, *args):
        await self.rollback()
        await self.session.close()

    async def commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
