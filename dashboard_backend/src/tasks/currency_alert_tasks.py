from datetime import datetime
from celery import Celery
from asgiref.sync import async_to_sync
from src.data.unitofwork import UnitOfWork
from src.services.alert_service import AlertService
from src.services.rate_service import RateService
from src.services.alert_service import AlertService
from src.celery_app import celery_app

@celery_app.task
def send_hourly_currency_alerts():
    """Задача для отправки часовых уведомлений"""
    async def async_send_alerts():
        uow = UnitOfWork()
        current_hour = datetime.now().hour
        
        alert_service = AlertService(uow)
        rate_service = RateService(uow)
        notification_service = AlertService(uow)
        
        alerts = await alert_service.find_alert_by_now_time(current_hour)
        
        for alert in alerts:
            try:
                if alert.notification_channel == "email":
                    rate = await rate_service.get_last_rate(alert.currency_id)
                    if rate is not None:
                        await notification_service.send_email_alert(
                            email=alert.user.email,
                            currency_code=alert.currency.code,
                            rate=rate
                        )
            except Exception as e:
                print(f"Failed to send alert {alert.id}: {e}")

    async_to_sync(async_send_alerts)()