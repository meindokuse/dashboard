from decimal import Decimal
from typing import Optional

from sqlalchemy import ForeignKey, DECIMAL, Boolean, Column, Integer
from sqlalchemy.orm import relationship, Mapped, mapped_column
from src.database.database import Base
from src.models.currency import Currency

class CurrencyAlert(Base):
    __tablename__ = "currency_alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    currency_id: Mapped[int] = mapped_column(ForeignKey("currencies.id"))
    threshold: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(10, 4))  # Порог изменения (5% = 0.05)
    is_active: Mapped[bool] = mapped_column(default=True)

    user = relationship("User", back_populates="alerts")
    currency = relationship("Currency", back_populates="alerts")