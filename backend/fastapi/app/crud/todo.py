from sqlalchemy.orm import Session

from app.models.models import TodoModel


class TodoCRUD:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_list(self) -> list[TodoModel]:
        return (
            self.db.query(TodoModel)
            .order_by(TodoModel.created_at.desc())
            .all()
        )

    def get_by_id(self, todo_id: int) -> TodoModel | None:
        return self.db.query(TodoModel).filter(TodoModel.id == todo_id).first()

    def create(self, data: dict) -> TodoModel:
        todo = TodoModel(**data)
        self.db.add(todo)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def update(self, todo_id: int, data: dict) -> TodoModel | None:
        todo = self.get_by_id(todo_id)
        if not todo:
            return None
        for key, value in data.items():
            setattr(todo, key, value)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def delete(self, todo_id: int) -> bool:
        todo = self.get_by_id(todo_id)
        if not todo:
            return False
        self.db.delete(todo)
        self.db.commit()
        return True
