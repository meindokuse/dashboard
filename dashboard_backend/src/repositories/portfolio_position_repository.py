from src.data.repository import SQLAlchemyRepository
from src.models.portfolio import PortfolioPosition


class PortfolioPositionRepository(SQLAlchemyRepository):
    model = PortfolioPosition