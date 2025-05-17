from datetime import time
from decimal import Decimal
from typing import Optional

from sqlalchemy import ForeignKey, DECIMAL, String
from sqlalchemy.orm import relationship, Mapped, mapped_column
from src.database.database import Base
from src.schemas.alerts import AlertReadBasic, AlertPortfolioRead


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

    def to_read_model(self) -> AlertReadBasic:
        return AlertReadBasic(
            id=self.id,
            user_id=self.user_id,
            currency_id=self.currency_id,
            notification_time=self.notification_time,
            notification_channel=self.notification_channel,
            is_active=self.is_active
        )

class PortfolioAlert(Base):
    __tablename__ = "portfolio_alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"))
    threshold: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(10, 4))
    is_active: Mapped[bool] = mapped_column(default=True)
    notification_channel: Mapped[str] = mapped_column(String(10), default="email")

    user = relationship("User", back_populates="portfolio_alerts")
    portfolio = relationship("Portfolio", back_populates="portfolio_alerts")

    def to_read_model(self) -> AlertPortfolioRead:
        return AlertPortfolioRead(
            id=self.id,
            user_id=self.user_id,
            portfolio_id=self.portfolio_id,
            threshold=self.threshold,
            is_active=self.is_active,
            notification_channel=self.notification_channel,
        )
