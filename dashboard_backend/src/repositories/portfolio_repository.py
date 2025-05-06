from src.data.repository import SQLAlchemyRepository
from src.models.portfolio import Portfolio


class PortfolioRepository(SQLAlchemyRepository):
    model = Portfolio
