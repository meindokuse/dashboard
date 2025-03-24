from typing import Optional

from sqlalchemy import String, Boolean, TIMESTAMP, Time, Column, Integer, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, time
from src.database.database import Base
from src.models.alerts import CurrencyAlert
from src.models.portfolio import Portfolio
from src.models.transaction import Transaction


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

    # Relationships
    portfolios: Mapped[list["Portfolio"]] = relationship(back_populates="user")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="user")
    alerts: Mapped[list["CurrencyAlert"]] = relationship(back_populates="user")
    balance: Mapped["UserBalance"] = relationship(back_populates="user")


class UserBalance(Base):
    __tablename__ = "user_balance"

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), primary_key=True)
    balance: Mapped[float] = mapped_column(DECIMAL(20, 2), default=10000.00)
    last_updated: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="balance")
