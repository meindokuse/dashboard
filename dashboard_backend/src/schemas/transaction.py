from datetime import datetime

from pydantic import BaseModel


class TransactionCreate(BaseModel):
    user_id: int
    currency_id:int
    type:str
    amount:float
    rate:float
    portfolio_id:int