from sqlalchemy import select

from src.data.repository import SQLAlchemyRepository
from src.models.transaction import Transaction


class TransactionRepository(SQLAlchemyRepository):
    model = Transaction

    async def find_all_with_time_sort(
            self,
            page: int,
            limit: int,
            time_column: str = "created_at",
            **filter_by
    ):
        """
        Получить записи с фильтрацией, пагинацией и сортировкой по времени

        Args:
            page: Номер страницы (начинается с 1)
            limit: Количество записей на странице (0 - без пагинации)
            time_column: Название колонки с временем для сортировки
            descending: Сортировка по убыванию (новые записи первыми)
            filter_by: Параметры фильтрации

        Returns:
            Список DTO моделей, отсортированных по времени
        """

        stmt = select(self.model).filter_by(**filter_by)

        time_attr = getattr(self.model, time_column)

        stmt = stmt.order_by(time_attr.desc())

        if limit > 0:
            start = (page - 1) * limit
            stmt = stmt.offset(start).limit(limit)

        # Выполняем запрос
        res = await self.session.execute(stmt)
        return [row[0].to_read_model() for row in res.all()]
