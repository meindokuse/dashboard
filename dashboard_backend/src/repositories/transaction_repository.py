from src.data.repository import SQLAlchemyRepository
from src.models.transaction import Transaction


class TransactionRepository(SQLAlchemyRepository):
    model = Transaction

