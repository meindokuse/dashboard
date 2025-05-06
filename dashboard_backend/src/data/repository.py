from abc import ABC, abstractmethod
from typing import List

from sqlalchemy import insert, select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert  # Импортируем insert из диалекта PostgreSQL



class AbstractRepository(ABC):
    @abstractmethod
    async def add_one(self, data: dict):
        raise NotImplementedError

    @abstractmethod
    async def find_all(self, page: int, limit: int):
        raise NotImplementedError


class SQLAlchemyRepository(AbstractRepository):
    model = None

    def __init__(self, session: AsyncSession):
        self.session = session


    async def add_all(self, data_list: List[dict], on_conflict_update: bool = False, conflict_fields: List[str] = None) -> List[int]:
        """
        Добавляет несколько записей в базу данных.
        :param conflict_fields:
        :param data_list: Список данных для добавления.
        :param on_conflict_update: Если True, обновляет записи при дубликате.
        :param conflict_fields: Поле, по которому проверяется дубликат.
        :return: Список ID добавленных или обновленных записей.
        """

        if on_conflict_update and conflict_fields:
            stmt = (
                insert(self.model)
                .values(data_list)
                .on_conflict_do_update(
                    index_elements=conflict_fields,  # Поле для проверки дубликата
                    set_={k: getattr(self.model, k) for k in data_list[0].keys()}  # Обновляем все поля
                )
                .returning(self.model.id)
            )
        else:
            stmt = insert(self.model).values(data_list).returning(self.model.id)

        res = await self.session.execute(stmt)
        return [row[0] for row in res.all()]

    async def get_table(self):
        stmt = select(self.model)
        res = await self.session.execute(stmt)
        res = [row[0].to_read_model() for row in res.all()]
        return res

    async def add_one(self, data: dict) -> int:
        try:
            stmt = insert(self.model).values(**data).returning(self.model.id)
            res = await self.session.execute(stmt)
            return res.scalar_one()
        except Exception as e:
            print(f"Error during insert: {e}")
            raise

    async def edit_one(self, id: int, data: dict) -> int:
        # Фильтруем данные, удаляя None значения
        filtered_data = {k: v for k, v in data.items() if v is not None}

        # Если после фильтрации не осталось полей для обновления
        if not filtered_data:
            return id  # или можно вызвать исключение

        stmt = update(self.model).values(**data).filter_by(id=id).returning(self.model.id)
        res = await self.session.execute(stmt)
        return res.scalar_one()

    async def find_all(self, page: int, limit: int, **filter_by):
        if limit == 0:

            stmt = (select(self.model)
                    .filter_by(**filter_by))

            res = await self.session.execute(stmt)
            res = [row[0].to_read_model() for row in res.all()]
            return res

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
        stmt = select(self.model).filter_by(**filter_by)
        res = await self.session.execute(stmt)
        res = res.scalar_one_or_none()
        if res:
            return res.to_read_model()
        return None

    async def delete_one(self,**filter_by):
        stmt = delete(self.model).filter_by(**filter_by)
        await self.session.execute(stmt)
