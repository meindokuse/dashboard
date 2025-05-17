import os
from datetime import datetime, timezone
from decimal import Decimal

import aiohttp
from fastapi_mail import MessageSchema, FastMail

from src.data.unitofwork import IUnitOfWork
from src.email_config import mail_conf
from src.schemas.alerts import AlertPortfolioCreate, AlertPortfolioRead, AlertPortfolioUpdate


class PortfolioAlertService:
    """Сервис для работы с уведомлениями по портфелям"""

    def __init__(self, uow: IUnitOfWork):
        """Инициализация сервиса с Unit of Work"""
        self.uow = uow

    async def create_alert(self, alert: AlertPortfolioCreate):
        """
        Создать уведомление для портфеля

        Args:
            alert: Данные для создания уведомления

        Returns:
            int: ID созданного уведомления
        """
        data = alert.model_dump()
        async with self.uow:
            id = await self.uow.alert_portfolio.add_one(data)
            await self.uow.commit()
            return id

    async def get_active_alerts(self):
        """
        Получить все активные уведомления

        Returns:
            List[AlertPortfolioRead]: Список активных уведомлений
        """
        list_alerts = await self.uow.alert_portfolio.find_all(page=1, limit=0, is_active=True)
        return list_alerts

    async def update_alert(self, alert: AlertPortfolioUpdate):
        """
        Обновить данные уведомления

        Args:
            alert: Новые данные уведомления

        Returns:
            int: ID обновленного уведомления
        """
        async with self.uow:
            id = await self.uow.alert_portfolio.edit_one(id=alert.id, data=alert.model_dump())
            await self.uow.commit()
            return id

    async def find_alert_by_portfolio_id(self, portfolio_id: int):
        """
        Найти уведомление по ID портфеля

        Args:
            portfolio_id: ID портфеля

        Returns:
            AlertPortfolioRead | None: Найденное уведомление или None
        """
        async with self.uow:
            alert = await self.uow.alert_portfolio.find_one(portfolio_id=portfolio_id)
            return alert

    async def find_alert_by_user_id(self, user_id: int):
        """
        Найти уведомление по ID пользователя

        Args:
            user_id: ID пользователя

        Returns:
            AlertPortfolioRead | None: Найденное уведомление или None
        """
        async with self.uow:
            alert = await self.uow.alert_portfolio.find_one(user_id=user_id)
            return alert

    async def find_all_alerts(self):
        """
        Получить все уведомления

        Returns:
            List[AlertPortfolioRead]: Список всех уведомлений
        """
        async with self.uow:
            alerts = await self.uow.alert_portfolio.find_all(page=1, limit=0)
            return alerts

    async def send_portfolio_email_alert(self, email: str, alert: AlertPortfolioRead,
                                         current_value: Decimal, profit_percent: float):
        """
        Отправить email-уведомление об изменении портфеля

        Args:
            email: Email адрес получателя
            alert: Данные уведомления
            current_value: Текущая стоимость портфеля
            profit_percent: Процент изменения стоимости

        Формирует HTML-письмо с информацией об изменении портфеля
        """
        change_type = "вырос" if profit_percent >= 0 else "упал"

        html_content = f"""
        <html>
        <body>
            <h2 style="color: #2a52be;">Сработало уведомление по портфелю</h2>
            <p>Стоимость вашего портфеля <strong>#{alert.portfolio_id}</strong> {change_type} на:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                <p style="font-size: 24px; margin: 0;">
                    <strong>{abs(profit_percent):.2f}%</strong> (порог: {alert.threshold:.2f}%)
                </p>
                <p style="font-size: 18px; margin: 10px 0 0 0;">
                    Текущая стоимость: <strong>{float(current_value):.2f}</strong> руб.
                </p>
            </div>
            <p style="color: #666; font-size: 12px;">
                Дата: {datetime.now(timezone.utc).astimezone().strftime('%d.%m.%Y %H:%M')}
            </p>
        </body>
        </html>
        """

        message = MessageSchema(
            subject=f"📊 Изменение портфеля #{alert.portfolio_id}",
            recipients=[email],
            body=html_content,
            subtype="html"
        )

        fm = FastMail(mail_conf)
        await fm.send_message(message)

    async def send_portfolio_tg_alert(self, unique_id: str, alert: AlertPortfolioRead,
                                      current_value: Decimal, profit_percent: float):
        """
        Отправить Telegram-уведомление об изменении портфеля

        Args:
            unique_id: Уникальный ID пользователя в Telegram
            alert: Данные уведомления
            current_value: Текущая стоимость портфеля
            profit_percent: Процент изменения стоимости

        Returns:
            bool: True если отправка успешна, False в случае ошибки
        """
        change_type = "📈 Вырос" if profit_percent >= 0 else "📉 Упад"
        message_text = (
            f"{change_type} на {abs(profit_percent):.2f}%\n"
            f"Порог: {alert.threshold:.2f}%\n"
            f"Текущая стоимость: {float(current_value):.2f} руб.\n"
            f"Портфель #{alert.portfolio_id}"
        )

        async with aiohttp.ClientSession() as session:
            async with session.post(
                    "http://localhost:8000/send_message",
                    headers={"X-Webhook-Secret": os.getenv("WEBHOOK_SECRET")},
                    json={
                        "unique_id": unique_id,
                        "text": message_text
                    }
            ) as response:
                return response.status == 200




