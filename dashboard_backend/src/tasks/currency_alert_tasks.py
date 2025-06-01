import asyncio
import logging
from datetime import datetime, timezone, timedelta
from src.data.unitofwork import UnitOfWork
from src.services.alert_service import AlertService
from src.services.rate_service import RateService
from src.celery_app import celery_app

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def send_hourly_currency_alerts(self):
    """Задача для отправки часовых уведомлений"""
    async def async_send_alerts():
        current_hour = (datetime.now(timezone.utc) + timedelta(hours=3)).hour
        logger.info(f"Task time: {current_hour}")

        async with UnitOfWork() as uow:
            alert_service = AlertService(uow)
            rate_service = RateService(uow)
            
            # Получаем все алерты одним запросом
            alerts = await alert_service.find_alert_by_now_time(current_hour)
            if not alerts:
                logger.info("No alerts found for hour %d", current_hour)
                return

            # Предзагружаем все необходимые связи
            for alert in alerts:
                # Явно загружаем связанные объекты
                try:
                    rate = await rate_service.get_last_rate_for_celery(alert.currency_id)
                    if rate is None:
                        logger.warning(f"No rate found for currency_id={alert.currency_id}")
                        continue

                    if alert.notification_channel == "email":
                        await alert_service.send_email_alert(
                            email=alert.user.email,
                            currency_code=alert.currency.code,
                            rate=rate
                        )
                    elif alert.notification_channel == "telegram":
                        await alert_service.send_tg_alert(
                            unique_id=alert.user.unique_id,
                            currency_code=alert.currency.code,
                            rate=rate
                        )
                    
                    logger.info(f"Sent alert {alert.id} to {alert.user.email}")
                except Exception as e:
                    logger.error(f"Failed to send alert {alert.id}: {e}")
                    await uow.rollback()
                    continue

            await uow.commit()

    try:
        # Создаем новую event loop для Celery
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(async_send_alerts())
    except Exception as e:
        logger.error(f"Task failed: {e}")
        raise self.retry(exc=e, countdown=60)
    finally:
        loop.close()
