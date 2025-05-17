from decimal import Decimal
from typing import Literal, Optional

from sqlalchemy import ForeignKey, DECIMAL, TIMESTAMP, String, Column, Integer
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone, timedelta
from src.database.database import Base
from src.schemas.transaction import TransactionRead


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    currency_id: Mapped[int] = mapped_column(ForeignKey("currencies.id"))
    type: Mapped[Literal["buy", "sell"]] = mapped_column(String(4))  # Тип операции
    amount: Mapped[Decimal] = mapped_column(DECIMAL(20, 8))  # Количество
    rate: Mapped[Decimal] = mapped_column(DECIMAL(20, 8))  # Курс на момент сделки
    timestamp: Mapped[datetime] = mapped_column(default=datetime.now())
    portfolio_id: Mapped[Optional[int]] = mapped_column(ForeignKey("portfolios.id"))

    # Relationships
    user = relationship("User", back_populates="transactions")
    currency = relationship("Currency", back_populates="transactions")
    portfolio = relationship("Portfolio", back_populates="transactions")

    def to_read_model(self) -> TransactionRead:
        return TransactionRead(
            id=self.id,
            user_id=self.user_id,
            currency_id=self.currency_id,
            type=self.type,
            amount=self.amount,
            rate=self.rate,
            timestamp=self.timestamp,
            portfolio_id=self.portfolio_id,
        )