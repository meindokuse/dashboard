from abc import ABC, abstractmethod
from typing import List

from sqlalchemy import insert, select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert  # Импортируем insert из диалекта PostgreSQL


class AbstractRepository(ABC):
    """Абстрактный базовый класс для репозиториев"""

    @abstractmethod
    async def add_one(self, data: dict):
        """Добавить одну запись в БД"""
        raise NotImplementedError

    @abstractmethod
    async def find_all(self, page: int, limit: int):
        """Получить все записи с пагинацией"""
        raise NotImplementedError


class SQLAlchemyRepository(AbstractRepository):
    """Реализация репозитория на SQLAlchemy для работы с БД"""

    model = None  # Модель SQLAlchemy должна быть определена в дочерних классах

    def __init__(self, session: AsyncSession):
        """Инициализация с сессией SQLAlchemy"""
        self.session = session

    async def add_all(self, data_list: List[dict], on_conflict_update: bool = False,
                      conflict_fields: List[str] = None) -> List[int]:
        """
        Массовое добавление записей с возможностью обновления при конфликте

        Args:
            data_list: Список словарей с данными для вставки
            on_conflict_update: Обновлять записи при конфликте
            conflict_fields: Поля для проверки конфликта

        Returns:
            Список ID добавленных/обновленных записей
        """
        if on_conflict_update and conflict_fields:
            stmt = (
                insert(self.model)
                .values(data_list)
                .on_conflict_do_update(
                    index_elements=conflict_fields,
                    set_={k: getattr(self.model, k) for k in data_list[0].keys()}
                )
                .returning(self.model.id)
            )
        else:
            stmt = insert(self.model).values(data_list).returning(self.model.id)

        res = await self.session.execute(stmt)
        return [row[0] for row in res.all()]

    async def get_table(self):
        """Получить все записи таблицы в виде DTO моделей"""
        stmt = select(self.model)
        res = await self.session.execute(stmt)
        res = [row[0].to_read_model() for row in res.all()]
        return res

    async def add_one(self, data: dict) -> int:
        """Добавить одну запись и вернуть её ID"""
        try:
            stmt = insert(self.model).values(**data).returning(self.model.id)
            res = await self.session.execute(stmt)
            return res.scalar_one()
        except Exception as e:
            print(f"Error during insert: {e}")
            raise

    async def edit_one(self, id: int, data: dict) -> int:
        """Обновить запись по ID (игнорирует None значения)"""
        filtered_data = {k: v for k, v in data.items() if v is not None}

        if not filtered_data:
            return id

        stmt = update(self.model).values(**filtered_data).filter_by(id=id).returning(self.model.id)
        res = await self.session.execute(stmt)
        return res.scalar_one()

    async def find_all(self, page: int, limit: int, **filter_by):
        """
        Получить записи с фильтрацией и пагинацией

        Args:
            page: Номер страницы
            limit: Количество записей на странице (0 - без пагинации)
            filter_by: Параметры фильтрации

        Returns:
            Список DTO моделей
        """
        if limit == 0:
            stmt = (select(self.model)
                    .filter_by(**filter_by)
                    .order_by(self.model.id))
        else:
            start = (page - 1) * limit
            stmt = (select(self.model)
                    .filter_by(**filter_by)
                    .order_by(self.model.id)
                    .offset(start)
                    .limit(limit))

        res = await self.session.execute(stmt)
        res = [row[0].to_read_model() for row in res.all()]
        return res

    async def find_one(self, **filter_by):
        """Найти одну запись по фильтру или вернуть None"""
        stmt = select(self.model).filter_by(**filter_by)
        res = await self.session.execute(stmt)
        res = res.scalar_one_or_none()
        if res:
            return res.to_read_model()
        return None

    async def delete_one(self, **filter_by):
        """Удалить записи по фильтру"""
        stmt = delete(self.model).filter_by(**filter_by)
        await self.session.execute(stmt)