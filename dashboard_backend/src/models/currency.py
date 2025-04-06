from datetime import datetime
from decimal import Decimal
from typing import Optional

from src.database.database import Base
from sqlalchemy import String, Boolean, Column, Integer, Text, DECIMAL, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship, Mapped, mapped_column


class Currency(Base):
    __tablename__ = "currencies"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(10), unique=True)
    name: Mapped[str] = mapped_column(String(50))
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_crypto: Mapped[bool] = mapped_column(default=False)

    exchange_rates = relationship("ExchangeRate", back_populates="currency", cascade="all, delete-orphan")
    positions = relationship("PortfolioPosition", back_populates="currency")
    transactions = relationship("Transaction", back_populates="currency")
    alerts = relationship("CurrencyAlert", back_populates="currency")


class ExchangeRate(Base):
    __tablename__ = "exchange_rates"

    id: Mapped[int] = mapped_column(primary_key=True)
    currency_id: Mapped[int] = mapped_column(ForeignKey("currencies.id"))
    rate: Mapped[Decimal] = mapped_column(DECIMAL(20, 8))
    timestamp: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    source: Mapped[str] = mapped_column(String(50))

    currency = relationship("Currency", back_populates="exchange_rates")