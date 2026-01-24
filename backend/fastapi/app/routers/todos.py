from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Todo
from app.schemas import TodoCreate, TodoResponse, TodoUpdate

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("", response_model=list[TodoResponse])
def get_todos(db: Session = Depends(get_db)):
    """全てのTODOを取得"""
    return db.query(Todo).order_by(Todo.created_at.desc()).all()


@router.get("/{todo_id}", response_model=TodoResponse)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    """指定IDのTODOを取得"""
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TODO not found"
        )
    return todo


@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(todo_data: TodoCreate, db: Session = Depends(get_db)):
    """新しいTODOを作成"""
    todo = Todo(**todo_data.model_dump())
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@router.patch("/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, todo_data: TodoUpdate, db: Session = Depends(get_db)):
    """TODOを更新"""
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TODO not found"
        )

    update_data = todo_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(todo, key, value)

    db.commit()
    db.refresh(todo)
    return todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    """TODOを削除"""
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TODO not found"
        )

    db.delete(todo)
    db.commit()
    return None
