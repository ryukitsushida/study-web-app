from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.exceptions import TodoNotFound
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
async def get_todos(db: AsyncSession = Depends(get_db)):
    """全てのTODOを取得"""
    return await TodoService(db).get_todos()


@router.get("/{todo_id}", response_model=GetTodoResponse)
async def get_todo(todo_id: int, db: AsyncSession = Depends(get_db)):
    """指定IDのTODOを取得"""
    todo = await TodoService(db).get_todo(todo_id)
    if not todo:
        raise TodoNotFound()
    return todo


@router.post("", response_model=CreateTodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(todo_data: CreateTodoRequest, db: AsyncSession = Depends(get_db)):
    """新しいTODOを作成"""
    return await TodoService(db).create_todo(todo_data)


@router.patch("/{todo_id}", response_model=UpdateTodoResponse)
async def update_todo(
    todo_id: int, todo_data: UpdateTodoRequest, db: AsyncSession = Depends(get_db)
):
    """TODOを更新"""
    todo = await TodoService(db).update_todo(todo_id, todo_data)
    if not todo:
        raise TodoNotFound()
    return todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(todo_id: int, db: AsyncSession = Depends(get_db)):
    """TODOを削除"""
    if not await TodoService(db).delete_todo(todo_id):
        raise TodoNotFound()
    return None
