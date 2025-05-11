from decimal import Decimal

from sqlalchemy import ForeignKey, String, TIMESTAMP, Boolean, Column, Integer, DECIMAL, Date
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, date

from src.database.database import Base


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[date] = mapped_column(Date,default=date.today())


    user = relationship("User", back_populates="portfolios")
    positions = relationship("PortfolioPosition", back_populates="portfolio", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="portfolio")
    portfolio_alerts = relationship("PortfolioAlert",back_populates="portfolio")


class PortfolioPosition(Base):
    __tablename__ = "portfolio_positions"

    id: Mapped[int] = mapped_column(primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id"))
    currency_id: Mapped[int] = mapped_column(ForeignKey("currencies.id"))
    amount: Mapped[Decimal] = mapped_column(DECIMAL(20, 8))
    purchase_rate: Mapped[Decimal] = mapped_column(DECIMAL(20, 8))
    purchased_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="positions")
    currency = relationship("Currency", back_populates="positions")