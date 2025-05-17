from sqlalchemy import select, func

from src.data.repository import SQLAlchemyRepository
from src.models.alerts import PortfolioAlert


class PortfolioAlertRepository(SQLAlchemyRepository):
    model = PortfolioAlert

    async def find_by_threshold(self, threshold: float):
        """Точное сравнение с округлением до 2 знаков"""
        threshold_rounded = round(threshold, 2)
        stmt = select(self.model).where(
            func.round(self.model.threshold, 2) == threshold_rounded
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()



