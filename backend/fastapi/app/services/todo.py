from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import TodoCRUD
from app.models.models import TodoModel
from app.schemas.todo import CreateTodoRequest, UpdateTodoRequest


class TodoService:
    def __init__(self, db: AsyncSession) -> None:
        self._crud = TodoCRUD(db)

    async def get_todos(self) -> list[TodoModel]:
        return await self._crud.get_list()

    async def get_todo(self, todo_id: int) -> TodoModel | None:
        return await self._crud.get_by_id(todo_id)

    async def create_todo(self, data: CreateTodoRequest) -> TodoModel:
        return await self._crud.create(data.model_dump())

    async def update_todo(
        self, todo_id: int, data: UpdateTodoRequest
    ) -> TodoModel | None:
        return await self._crud.update(todo_id, data.model_dump(exclude_unset=True))

    async def delete_todo(self, todo_id: int) -> bool:
        return await self._crud.delete(todo_id)
