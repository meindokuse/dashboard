from src.data.repository import SQLAlchemyRepository
from src.models.currency import Currency


class CurrencyRepository(SQLAlchemyRepository):
    model = Currency




