from decimal import Decimal

from sqlalchemy import ForeignKey, String, TIMESTAMP, Boolean, Column, Integer, DECIMAL, Date
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, date

from src.database.database import Base
from src.schemas.portfolio import PortfolioRead, PortfolioPositionRead


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[date] = mapped_column(Date,default=date.today())


    user = relationship("User", back_populates="portfolios")
    positions = relationship("PortfolioPosition", back_populates="portfolio", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="portfolio", cascade="all, delete-orphan")
    portfolio_alerts = relationship("PortfolioAlert",back_populates="portfolio", cascade="all, delete-orphan")

    def to_read_model(self) -> PortfolioRead:
        return PortfolioRead(
            id=self.id,
            user_id=self.user_id,
            name=self.name,
            created_at=self.created_at,
        )


class PortfolioPosition(Base):
    __tablename__ = "portfolio_positions"

    id: Mapped[int] = mapped_column(primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"))
    currency_id: Mapped[int] = mapped_column(ForeignKey("currencies.id"))
    amount: Mapped[Decimal] = mapped_column(DECIMAL(20, 8))
    purchase_rate: Mapped[Decimal] = mapped_column(DECIMAL(20, 8))
    purchased_at: Mapped[datetime] = mapped_column(default=datetime.now())

    portfolio = relationship("Portfolio", back_populates="positions")
    currency = relationship("Currency", back_populates="positions")

    def to_read_model(self) -> PortfolioPositionRead:
        return PortfolioPositionRead(
            id=self.id,
            portfolio_id=self.portfolio_id,
            currency_id=self.currency_id,
            amount=self.amount,
            purchase_rate=self.purchase_rate,
            purchased_at=self.purchased_at,
        )