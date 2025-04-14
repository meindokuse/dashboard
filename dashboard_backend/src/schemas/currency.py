from pydantic import BaseModel


class CurrencyRead(BaseModel):
    id:int
    code:str
    name:str
    description:str
