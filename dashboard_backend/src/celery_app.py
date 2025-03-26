from celery import Celery
from src.config import CELERY_BROKER_URL,CELERY_RESULT_BACKEND  # Импортируйте настройки проекта

celery_app = Celery(
    "tasks",
    broker=CELERY_BROKER_URL,  # Например, "redis://localhost:6379/0"
    backend=CELERY_RESULT_BACKEND,  # Например, "redis://localhost:6379/1"
    include=["src.tasks.auth_tasks"],  # Укажите правильный путь к модулю!
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)