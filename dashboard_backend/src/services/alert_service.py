import logging
import os
from datetime import datetime
from decimal import Decimal

import aiohttp
from fastapi_mail import FastMail, MessageSchema
from src.data.unitofwork import IUnitOfWork
from src.email_config import mail_conf
from src.schemas.alerts import AlertCreate, AlertUpdate

logger = logging.getLogger(__name__)


class AlertService:
    """Сервис для работы с уведомлениями о курсах валют"""

    def __init__(self, uow: IUnitOfWork):
        """Инициализация сервиса с Unit of Work"""
        self.uow = uow

    async def create_alert(self, alert: AlertCreate):
        """
        Создать новое уведомление

        Args:
            alert: Данные для создания уведомления

        Returns:
            int: ID созданного уведомления
        """
        data = alert.model_dump()
        async with self.uow:
            id = await self.uow.alert.add_one(data)
            await self.uow.commit()
            return id

    async def find_alert_by_now_time(self, hour: int):
        """
        Найти уведомления для текущего часа

        Args:
            hour: Текущий час (0-23)

        Returns:
            List[Alert]: Список уведомлений
        """
        list_alerts = await self.uow.alert.find_alert_by_now_time(hour)
        return list_alerts

    async def find_alert_by_user_id(self, user_id: int):
        """
        Найти уведомление по ID пользователя

        Args:
            user_id: ID пользователя

        Returns:
            Alert | None: Найденное уведомление или None
        """
        async with self.uow:
            alert = await self.uow.alert.find_one(user_id=user_id)
            return alert

    async def send_email_alert(self, email: str, currency_code: str, rate: Decimal):
        """
        Отправить email-уведомление об изменении курса

        Args:
            email: Email адрес получателя
            currency_code: Код валюты (например 'USD')
            rate: Текущий курс валюты

        Формирует красивое HTML-письмо с информацией о курсе
        """
        html_content = f"""
        <html>
        <body>
            <h2 style="color: #2a52be;">Обновление курса валюты</h2>
            <p>Курс <strong>{currency_code}</strong> изменился:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                <p style="font-size: 24px; margin: 0;">
                    <strong>{float(rate):.4f}</strong> руб.
                </p>
            </div>
            <p style="color: #666; font-size: 12px;">
                Дата обновления: {datetime.now().strftime('%d.%m.%Y %H:%M')}
            </p>
        </body>
        </html>
        """

        message = MessageSchema(
            subject=f"💰 Курс {currency_code} обновлён",
            recipients=[email],
            body=html_content,
            subtype="html"
        )

        fm = FastMail(mail_conf)
        await fm.send_message(message)

    async def send_tg_alert(self, unique_id: str, currency_code: str, rate: Decimal):
        """
        Отправить Telegram-уведомление об изменении курса

        Args:
            unique_id: Уникальный ID пользователя в Telegram
            currency_code: Код валюты
            rate: Текущий курс

        Returns:
            bool: True если отправка успешна, False в случае ошибки
        """
        async with aiohttp.ClientSession() as session:
            async with session.post(
                    "http://localhost:8000/send_message",
                    headers={"X-Webhook-Secret": os.getenv("WEBHOOK_SECRET")},
                    json={
                        "unique_id": unique_id,
                        "text": f"Текущий курс {currency_code}: {rate}"
                    }
            ) as response:
                if response.status == 200:
                    logger.info(f"Telegram message sent to unique_id={unique_id}")
                    return True
                else:
                    logger.warning(f"Failed to send Telegram message to unique_id={unique_id}: {response.status}")
                    return False

    async def update_alert(self, alert: AlertUpdate):
        """
        Обновить данные уведомления

        Args:
            alert: Новые данные уведомления

        Returns:
            int: ID обновленного уведомления
        """
        data = alert.model_dump()
        async with self.uow:
            id = await self.uow.alert.edit_one(data['id'], data)
            await self.uow.commit()
            return id