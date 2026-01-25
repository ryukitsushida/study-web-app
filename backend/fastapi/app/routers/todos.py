from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.todo import (
    CreateTodoRequest,
    CreateTodoResponse,
    GetTodoResponse,
    UpdateTodoRequest,
    UpdateTodoResponse,
)
from app.services import TodoService

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("", response_model=list[GetTodoResponse])
def get_todos(db: Session = Depends(get_db)):
    """全てのTODOを取得"""
    return TodoService(db).get_todos()


@router.get("/{todo_id}", response_model=GetTodoResponse)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    """指定IDのTODOを取得"""
    todo = TodoService(db).get_todo(todo_id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TODO not found"
        )
    return todo


@router.post("", response_model=CreateTodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(todo_data: CreateTodoRequest, db: Session = Depends(get_db)):
    """新しいTODOを作成"""
    return TodoService(db).create_todo(todo_data)


@router.patch("/{todo_id}", response_model=UpdateTodoResponse)
def update_todo(
    todo_id: int, todo_data: UpdateTodoRequest, db: Session = Depends(get_db)
):
    """TODOを更新"""
    todo = TodoService(db).update_todo(todo_id, todo_data)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TODO not found"
        )
    return todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    """TODOを削除"""
    if not TodoService(db).delete_todo(todo_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TODO not found"
        )
    return None
