import redis  # Импорт модуля целиком для явности
import json
from typing import Annotated
from fastapi import HTTPException, Depends
from redis import Redis
from starlette.requests import Request

from src.database.cache import redis_pool


def get_current_user(request: Request):

    redis = Redis(connection_pool=redis_pool)
    session_id = request.cookies.get("session_id") or request.headers.get("x-session-id")
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session_data = redis.get(f"session:{session_id}")

    if not session_data:
        raise HTTPException(status_code=401, detail="Session expired")
    data = json.loads(session_data)
    if data["ip"] != request.client.host:
        redis.delete(f"session:{session_id}")
        raise HTTPException(status_code=401, detail="IP changed. Please relogin.")

    return data["user_id"]

session_dep = Annotated[int, Depends(get_current_user)]