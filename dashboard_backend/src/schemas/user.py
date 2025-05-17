from datetime import time, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

class UserResponseLogin(BaseModel):
    email: str
    password: str
    is_remember: bool

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserRead(BaseModel):
    id:int
    username: str
    email: str
    created_at: datetime
    balance:float
    unique_id: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    telegram_id: Optional[str] = None

class UserValidateModel(BaseModel):
    id:int
    username: str
    email: str
    password_hash: str






