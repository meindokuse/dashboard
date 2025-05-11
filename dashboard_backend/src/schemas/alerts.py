from datetime import time
from pydantic import BaseModel


class AlertResponse(BaseModel):
    currency_id: int
    notification_time:time
    notification_channel:str

class AlertCreate(BaseModel):
    user_id:int
    currency_id: int
    notification_time:time
    notification_channel:str 

class AlertRead(BaseModel):
    id:int
    user_id:int
    currency_id: int
    notification_time:time
    notification_channel:str 

class AlertPortfolioResponse(BaseModel):
    portfolio_id: int
    threshold:float
    notification_channel:str

class AlertPortfolioCreate(BaseModel):
    user_id:int
    portfolio_id: int
    threshold:float
    notification_channel:str 

class AlertPortfolioRead(BaseModel):
    id:int
    user_id:int
    portfolio_id: int
    threshold:float
    notification_channel:str 

