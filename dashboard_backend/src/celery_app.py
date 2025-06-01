from celery import Celery
from src.config import CELERY_BROKER_URL, CELERY_RESULT_BACKEND
from celery.schedules import crontab

celery_app = Celery(
    "tasks",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=[
        "src.tasks.auth_tasks",
        "src.tasks.currency_tasks",
        "src.tasks.currency_alert_tasks"
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_concurrency=10,
    worker_pool="threads",
    worker_max_tasks_per_child=100,
    task_track_started=True,
)

celery_app.conf.beat_schedule = {
    "update-rates-every-5-minutes": {
        "task": "src.tasks.currency_tasks.update_currency_rates",
        "schedule": crontab(minute="*/5"),
    },
    "send_currency_alerts": {
        "task": "src.tasks.currency_alert_tasks.send_hourly_currency_alerts",
        "schedule": crontab(hour="*", minute=1),
    },

}
