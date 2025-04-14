
from src.celery_app import celery_app
import json
from redis import Redis  # Используем синхронный клиент Redis

from src.database.cache import redis_pool


@celery_app.task
def save_session_to_redis(user_id: str, user_ip: str, is_remember: bool, session_id: str):
    # Создаем синхронное подключение к Redis
    redis = Redis(connection_pool=redis_pool)    # Сохраняем сессию
    expire_time = 30 * 86400 if is_remember else 0  # 30 дней или без истечения
    redis.setex(
        f"session:{session_id}",
        expire_time,
        value=json.dumps({"user_id": user_id, "ip": user_ip})
    )

    # Закрываем подключение
    redis.close()