from sqlalchemy import select

from src.data.repository import SQLAlchemyRepository
from src.models.user import User


class UserRepository(SQLAlchemyRepository):
    model = User

    async def valid_employer(self, **filter_by):
        stmt = select(self.model).filter_by(**filter_by)
        res = await self.session.execute(stmt)
        res = res.scalar_one_or_none()
        if res:
            return res.to_read_model_for_validate()
        return None