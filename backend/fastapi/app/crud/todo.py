from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import TodoModel


class TodoCRUD:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_list(self) -> list[TodoModel]:
        result = await self.db.execute(
            select(TodoModel).order_by(TodoModel.created_at.desc())
        )
        return result.scalars().all()

    async def get_by_id(self, todo_id: int) -> TodoModel | None:
        return await self.db.get(TodoModel, todo_id)

    async def create(self, data: dict) -> TodoModel:
        todo = TodoModel(**data)
        self.db.add(todo)
        await self.db.flush()
        await self.db.refresh(todo)
        return todo

    async def update(self, todo_id: int, data: dict) -> TodoModel | None:
        todo = await self.get_by_id(todo_id)
        if not todo:
            return None
        for key, value in data.items():
            setattr(todo, key, value)
        await self.db.flush()
        await self.db.refresh(todo)
        return todo

    async def delete(self, todo_id: int) -> bool:
        stmt = delete(TodoModel).where(TodoModel.id == todo_id)
        result = await self.db.execute(stmt)
        await self.db.flush()
        return result.rowcount > 0
