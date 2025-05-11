from datetime import time

from fastapi_mail import FastMail, MessageSchema
from src.data.unitofwork import IUnitOfWork
from src.schemas.alerts import AlertCreate


class AlertService:
    def __init__(self,uow:IUnitOfWork):
        self.uow = uow        

    async def create_alert(self,alert: AlertCreate):
        data = alert.model_dump()
        async with self.uow:
            id = await self.uow.alert.add_one(data)
            return id
    
    async def find_alert_by_now_time(self):
        now_time = time

    async def send_email_alert(self, email: str, currency_code: str, rate: Decimal):
        """Отправляем email уведомление"""
        message = MessageSchema(
            subject=f"Курс {currency_code}",
            recipients=[email],
            body=f"Текущий курс {currency_code}: {rate}",
            subtype="plain"
        )
        
        fm = FastMail(mail_conf)
        await fm.send_message(message)
        

                 
    