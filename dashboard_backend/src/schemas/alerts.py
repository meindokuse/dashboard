from datetime import time
from typing import Optional

from pydantic import BaseModel


class AlertResponse(BaseModel):
    currency_id: int
    notification_time: time
    notification_channel: str


class AlertUpdate(BaseModel):
    id: int
    currency_id: Optional[int] = None
    notification_time: Optional[time] = None
    is_active: Optional[bool] = None
    notification_channel: Optional[str] = None


class AlertCreate(BaseModel):
    user_id: int
    currency_id: int
    notification_time: time
    notification_channel: str


class AlertReadBasic(BaseModel):
    id: int
    user_id: int
    currency_id: int
    notification_time: time
    notification_channel: str
    is_active: bool


class AlertPortfolioResponse(BaseModel):
    portfolio_id: int
    threshold: float
    notification_channel: str


class AlertPortfolioCreate(BaseModel):
    user_id: int
    portfolio_id: int
    threshold: float
    notification_channel: str


class AlertPortfolioUpdate(BaseModel):
    id: int
    is_active: bool
    portfolio_id: Optional[int] = None
    threshold: Optional[float] = None
    notification_channel: Optional[str] = None


class AlertPortfolioRead(BaseModel):
    id: int
    user_id: int
    portfolio_id: int
    threshold: float
    notification_channel: str
    is_active: bool
