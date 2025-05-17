from sqlalchemy import select

from src.data.repository import SQLAlchemyRepository
from src.models.transaction import Transaction


class TransactionRepository(SQLAlchemyRepository):
    model = Transaction

    async def get_latest_records(
            self,
            page: int,
            limit: int,
            **filter_by
    ):
        """
        Получить записи с пагинацией, отсортированные по timestamp (новые первые)

        Args:
            page: Номер страницы (начинается с 1)
            limit: Количество записей на странице
            filter_by: Параметры фильтрации (например, user_id=1)

        Returns:
            Список DTO моделей, отсортированных от новых к старым
        """
        stmt = (
            select(self.model)
            .filter_by(**filter_by)
            .order_by(self.model.timestamp.desc())
            .offset((page - 1) * limit)
            .limit(limit)
        )

        result = await self.session.execute(stmt)
        return [row[0].to_read_model() for row in result.all()]
