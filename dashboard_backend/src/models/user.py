from typing import Optional

from sqlalchemy import String, Boolean, TIMESTAMP, Time, Column, Integer, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, time
from src.schemas.alerts import AlertPortfolioRead, AlertRead
from src.schemas.portfolio import PortfolioRead
from src.schemas.transaction import TransactionRead
from src.database.database import Base
from src.models.alerts import CurrencyAlert
from src.models.portfolio import Portfolio
from src.models.transaction import Transaction
from src.schemas.user import UserRead, UserValidateModel


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(100), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    telegram_id: Mapped[Optional[str]] = mapped_column(String(50),nullable=True)
    notification_time: Mapped[Optional[time]] = mapped_column(Time,nullable=True)
    notification_channel: Mapped[str] = mapped_column(String(10), default="email")
    balance: Mapped[float] = mapped_column(DECIMAL(10,2), nullable=False,default=10000.0)

    # Relationships
    portfolios = relationship("Portfolio",back_populates="user")
    transactions = relationship("Transaction",back_populates="user")
    alerts = relationship("CurrencyAlert",back_populates="user")
    portfolio_alerts = relationship(
        "PortfolioAlert",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    def to_read_model(self) -> UserRead:
        return UserRead(
            id=self.id,
            username=self.username,
            email=self.email,
            created_at=self.created_at,
            balance=self.balance,
            telegram_id=self.telegram_id,
            notification_time=self.notification_time,
            notification_channel=self.notification_channel,
        )
    def to_read_model_for_validate(self) -> UserValidateModel:
        return UserValidateModel(
            id=self.id,
            username=self.username,
            email=self.email,
            password_hash=self.password_hash,
        )

#
# class UserBalance(Base):
#     __tablename__ = "user_balance"
#
#     user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), primary_key=True)
#     balance: Mapped[float] = mapped_column(DECIMAL(20, 2), default=10000.00)
#     last_updated: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)
#
#     # Relationships
#     user = relationship("User", back_populates="balance")
