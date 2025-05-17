from sqlalchemy import select, extract
from sqlalchemy.orm import joinedload

from src.models.alerts import CurrencyAlert
from src.data.repository import SQLAlchemyRepository


class AlertRepository(SQLAlchemyRepository):
    model = CurrencyAlert

    async def find_alert_by_now_time(self, hour: int):
        """
        Находит активные уведомления, где час notification_time совпадает с переданным hour.

        Args:
            hour (int): Час для фильтрации (0-23).
            session (AsyncSession): Асинхронная сессия SQLAlchemy.

        Returns:
            List[CurrencyAlert]: Список активных уведомлений.
        """
        stmt = (
            select(self.model)
            .where(
                self.model.is_active == True,
                extract("hour", self.model.notification_time) == hour)
            .options(
                joinedload(self.model.user),
                joinedload(self.model.currency)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
