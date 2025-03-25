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
    telegram_id:Optional[str] = None
    notification_time:Optional[time] = None
    notification_channel:Optional[str] = None

class UserRead(BaseModel):
    id:int
    username: str
    email: str
    created_at: datetime
    balance:float
    telegram_id: Optional[str] = None
    notification_time: Optional[time] = None
    notification_channel: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    telegram_id: Optional[str] = None
    notification_time: Optional[str] = None  # "18:00"
    notification_channel:Optional[str] = None

class UserValidateModel(BaseModel):
    id:int
    username: str
    email: str
    password_hash: str






