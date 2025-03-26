import json
from typing import Annotated

from fastapi import HTTPException
from fastapi.params import Depends
from redis.asyncio import Redis
from starlette.requests import Request


async def get_current_user(request: Request, redis_client: Redis):
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(401, "Not authenticated")

    session_data = await redis_client.get(f"session:{session_id}")
    if not session_data:
        raise HTTPException(401, "Session expired")

    data = json.loads(session_data)
    if data["ip"] != request.client.host:  # Если IP изменился
        await redis_client.delete(f"session:{session_id}")  # Удаляем сессию
        raise HTTPException(401, "IP changed. Please relogin.")

    return data["user_id"]

session_dep = Annotated[int,Depends(get_current_user)]
