from src.models.alerts import CurrencyAlert
from src.data.repository import SQLAlchemyRepository

class AlertRepository(SQLAlchemyRepository):
    model = CurrencyAlert