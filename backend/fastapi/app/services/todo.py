from sqlalchemy.orm import Session

from app.crud import TodoCRUD
from app.models.models import TodoModel
from app.schemas.todo import CreateTodoRequest, UpdateTodoRequest


class TodoService:
    def __init__(self, db: Session) -> None:
        self._crud = TodoCRUD(db)

    def get_todos(self) -> list[TodoModel]:
        return self._crud.get_list()

    def get_todo(self, todo_id: int) -> TodoModel | None:
        return self._crud.get_by_id(todo_id)

    def create_todo(self, data: CreateTodoRequest) -> TodoModel:
        return self._crud.create(data.model_dump())

    def update_todo(self, todo_id: int, data: UpdateTodoRequest) -> TodoModel | None:
        return self._crud.update(todo_id, data.model_dump(exclude_unset=True))

    def delete_todo(self, todo_id: int) -> bool:
        return self._crud.delete(todo_id)
