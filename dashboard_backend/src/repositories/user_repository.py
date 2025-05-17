from sqlalchemy import select, update

from src.data.repository import SQLAlchemyRepository
from src.models.user import User


class UserRepository(SQLAlchemyRepository):
    model = User

    async def valid_employer(self, **filter_by):
        """Валидоация по логину и паролю."""

        stmt = select(self.model).filter_by(**filter_by)
        res = await self.session.execute(stmt)
        res = res.scalar_one_or_none()
        if res:
            return res.to_read_model_for_validate()
        return None

    async def update_balance(self,id:int,new_balance:float):
        """Обновление баланса для пользователя."""

        stmt = (
            update(self.model)
            .values(balance=new_balance)
            .filter_by(id=id)
            .returning(self.model.id)
        )
        res = await self.session.execute(stmt)
        return res.scalar_one()