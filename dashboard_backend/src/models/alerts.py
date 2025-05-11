from datetime import time
from decimal import Decimal
from typing import Optional

from sqlalchemy import ForeignKey, DECIMAL, Boolean, Column, Integer, String
from sqlalchemy.orm import relationship, Mapped, mapped_column
from src.database.database import Base
from src.models.currency import Currency

class CurrencyAlert(Base):
    __tablename__ = "currency_alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    currency_id: Mapped[int] = mapped_column(ForeignKey("currencies.id"))
    is_active: Mapped[bool] = mapped_column(default=True)
    notification_time: Mapped[time] = mapped_column(nullable=False)
    notification_channel: Mapped[str] = mapped_column(String(10), default="email")

    user = relationship("User", back_populates="alerts")
    currency = relationship("Currency", back_populates="alerts")

class PortfolioAlert(Base):
    __tablename__ = "portfolio_alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id"))
    threshold: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(10, 4))  # Порог изменения (5% = 0.05)
    is_active: Mapped[bool] = mapped_column(default=True)

    user = relationship("User", back_populates="portfolio_alerts")
    portfolio = relationship("Portfolio", back_populates="portfolio_alerts")
