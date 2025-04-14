from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class ExchangeRateRead(BaseModel):
    id:int
    currency_id:int
    rate:float
    timestamp:datetime
    source:str

class ExchangeRateCreate(BaseModel):
    currency_id:int
    rate:float
    timestamp:datetime
    source:str






