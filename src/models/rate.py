from decimal import Decimal

from sqlalchemy import ForeignKey, DECIMAL, TIMESTAMP, String, Column, Integer
from sqlalchemy.orm import relationship, mapped_column, Mapped
from datetime import datetime

from src.database.database import Base
from src.models.currency import Currency


class ExchangeRate(Base):
    __tablename__ = "exchange_rates"

    id: Mapped[int] = mapped_column(primary_key=True)
    currency_id: Mapped[int] = mapped_column(ForeignKey("currencies.id"))
    rate: Mapped[Decimal] = mapped_column(DECIMAL(20, 8))  # Текущий курс
    timestamp: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    source: Mapped[str] = mapped_column(String(50))  # moex/binance

    currency = relationship(back_populates="exchange_rates")
