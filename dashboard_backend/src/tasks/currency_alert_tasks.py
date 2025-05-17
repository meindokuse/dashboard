
import logging
from datetime import datetime, timezone
from asgiref.sync import async_to_sync
from src.data.unitofwork import UnitOfWork
from src.services.alert_service import AlertService
from src.services.rate_service import RateService
from src.celery_app import celery_app

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@celery_app.task
def send_hourly_currency_alerts():
    """Задача для отправки часовых уведомлений"""
    async def async_send_alerts():
        async with UnitOfWork() as uow:
            alert_service = AlertService(uow)
            rate_service = RateService(uow)
            current_hour = datetime.now(timezone.utc).hour

            logger.info(f"Task time: {current_hour}")

            alerts = await alert_service.find_alert_by_now_time(current_hour)
            if not alerts:
                logger.info("No alerts found for hour %d", current_hour)
                return

            for alert in alerts:
                try:
                    if alert.notification_channel == "email":
                        rate = await rate_service.get_last_rate_for_celery(alert.currency_id)
                        if rate is not None:
                            await alert_service.send_email_alert(
                                email=alert.user.email,
                                currency_code=alert.currency.code,
                                rate=rate
                            )
                            logger.info(f"Sent alert {alert.id} to {alert.user.email}")
                        else:
                            logger.warning(f"No rate found for currency_id={alert.currency_id}")
                    if alert.notification_channel == "telegram":
                        rate = await rate_service.get_last_rate_for_celery(alert.currency_id)
                        if rate is not None:
                            await alert_service.send_tg_alert(
                                unique_id=alert.user.unique_id,
                                currency_code=alert.currency.code,
                                rate=rate
                            )
                            logger.info(f"Sent alert {alert.id} to {alert.user.email}")
                        else:
                            logger.warning(f"No rate found for currency_id={alert.currency_id}")


                except Exception as e:
                    logger.error(f"Failed to send alert {alert.id}: {e}")
                    continue
            await uow.commit()

    async_to_sync(async_send_alerts)()

