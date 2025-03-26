

from src.celery_app import celery_app
from datetime import timedelta
import json

from redis.asyncio import Redis  # Используем асинхронный клиент Redis


@celery_app.task
def save_session_to_redis(user_id: str, user_ip: str, is_remember: bool, session_id: str):
    # Создаём новое подключение внутри задачи (без async with)
    redis = Redis(host='localhost', port=6379, db=0, decode_responses=True)

    # Запускаем асинхронный код синхронно через asyncio.run()
    import asyncio
    async def _save():
        expire_time = 30 * 86400 if is_remember else 0
        await redis.setex(
            f"session:{session_id}",
            expire_time,
            value=json.dumps({"user_id": user_id, "ip": user_ip})
        )
        await redis.close()

    return asyncio.run(_save())
