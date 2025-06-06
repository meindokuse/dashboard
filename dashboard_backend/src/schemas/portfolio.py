from datetime import datetime, date

from pydantic import BaseModel


class PortfolioCreate(BaseModel):
    user_id: int
    name:str

class PortfolioRead(BaseModel):
    id:int
    user_id: int
    name: str
    created_at: date

class PortfolioUpdate(BaseModel):
    name:str

class PortfolioPositionCreateResponse(BaseModel):
    portfolio_id:int
    currency_id:int
    amount:float

class PortfolioPositionUpdateResponse(BaseModel):
    id:int
    type:str
    amount:float


class PortfolioPositionCreate(BaseModel):
    portfolio_id: int
    currency_id: int
    amount: float
    purchase_rate: float

class PortfolioPositionRead(BaseModel):
    id:int
    portfolio_id:int
    currency_id:int
    amount:float
    purchase_rate:float
    purchased_at:datetime


