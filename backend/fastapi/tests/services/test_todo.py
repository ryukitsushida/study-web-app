from unittest.mock import AsyncMock, MagicMock, patch

from app.models.models import TodoModel
from app.schemas.todo import CreateTodoRequest, UpdateTodoRequest
from app.services import TodoService


def _make_todo_model(**kwargs) -> TodoModel:
    defaults = {
        "id": 1,
        "title": "テスト",
        "description": None,
        "completed": False,
        "created_at": "2026-01-01T00:00:00",
        "updated_at": "2026-01-01T00:00:00",
    }
    defaults.update(kwargs)
    model = MagicMock(spec=TodoModel)
    for k, v in defaults.items():
        setattr(model, k, v)
    return model


class TestTodoServiceGetTodos:
    @patch("app.services.todo.TodoCRUD")
    async def test_get_todos(self, mock_crud_cls):
        mock_crud = mock_crud_cls.return_value
        expected = [_make_todo_model(id=1), _make_todo_model(id=2)]
        mock_crud.get_list = AsyncMock(return_value=expected)

        db = AsyncMock()
        result = await TodoService(db).get_todos()

        assert result == expected
        mock_crud.get_list.assert_awaited_once()


class TestTodoServiceGetTodo:
    @patch("app.services.todo.TodoCRUD")
    async def test_get_todo(self, mock_crud_cls):
        mock_crud = mock_crud_cls.return_value
        expected = _make_todo_model(id=1)
        mock_crud.get_by_id = AsyncMock(return_value=expected)

        db = AsyncMock()
        result = await TodoService(db).get_todo(1)

        assert result == expected
        mock_crud.get_by_id.assert_awaited_once_with(1)

    @patch("app.services.todo.TodoCRUD")
    async def test_get_todo_not_found(self, mock_crud_cls):
        mock_crud = mock_crud_cls.return_value
        mock_crud.get_by_id = AsyncMock(return_value=None)

        db = AsyncMock()
        result = await TodoService(db).get_todo(99999)

        assert result is None


class TestTodoServiceCreateTodo:
    @patch("app.services.todo.TodoCRUD")
    async def test_create_todo(self, mock_crud_cls):
        mock_crud = mock_crud_cls.return_value
        expected = _make_todo_model(id=1, title="新規タスク", description="説明")
        mock_crud.create = AsyncMock(return_value=expected)

        db = AsyncMock()
        request = CreateTodoRequest(title="新規タスク", description="説明")
        result = await TodoService(db).create_todo(request)

        assert result == expected
        mock_crud.create.assert_awaited_once_with(request.model_dump())

    @patch("app.services.todo.TodoCRUD")
    async def test_create_todo_without_description(self, mock_crud_cls):
        mock_crud = mock_crud_cls.return_value
        expected = _make_todo_model(id=1, title="説明なし")
        mock_crud.create = AsyncMock(return_value=expected)

        db = AsyncMock()
        request = CreateTodoRequest(title="説明なし")
        result = await TodoService(db).create_todo(request)

        assert result == expected
        mock_crud.create.assert_awaited_once_with(request.model_dump())


class TestTodoServiceUpdateTodo:
    @patch("app.services.todo.TodoCRUD")
    async def test_update_todo(self, mock_crud_cls):
        mock_crud = mock_crud_cls.return_value
        expected = _make_todo_model(id=1, title="更新後", completed=True)
        mock_crud.update = AsyncMock(return_value=expected)

        db = AsyncMock()
        request = UpdateTodoRequest(title="更新後", completed=True)
        result = await TodoService(db).update_todo(1, request)

        assert result == expected
        mock_crud.update.assert_awaited_once_with(
            1, request.model_dump(exclude_unset=True)
        )

    @patch("app.services.todo.TodoCRUD")
    async def test_update_todo_partial(self, mock_crud_cls):
        mock_crud = mock_crud_cls.return_value
        expected = _make_todo_model(id=1, completed=True)
        mock_crud.update = AsyncMock(return_value=expected)

        db = AsyncMock()
        request = UpdateTodoRequest(completed=True)
        result = await TodoService(db).update_todo(1, request)

        assert result == expected
        # exclude_unset=True で title が含まれないことを確認
        mock_crud.update.assert_awaited_once_with(1, {"completed": True})

    @patch("app.services.todo.TodoCRUD")
    async def test_update_todo_not_found(self, mock_crud_cls):
        mock_crud = mock_crud_cls.return_value
        mock_crud.update = AsyncMock(return_value=None)

        db = AsyncMock()
        request = UpdateTodoRequest(title="存在しない")
        result = await TodoService(db).update_todo(99999, request)

        assert result is None


class TestTodoServiceDeleteTodo:
    @patch("app.services.todo.TodoCRUD")
    async def test_delete_todo(self, mock_crud_cls):
        mock_crud = mock_crud_cls.return_value
        mock_crud.delete = AsyncMock(return_value=True)

        db = AsyncMock()
        result = await TodoService(db).delete_todo(1)

        assert result is True
        mock_crud.delete.assert_awaited_once_with(1)

    @patch("app.services.todo.TodoCRUD")
    async def test_delete_todo_not_found(self, mock_crud_cls):
        mock_crud = mock_crud_cls.return_value
        mock_crud.delete = AsyncMock(return_value=False)

        db = AsyncMock()
        result = await TodoService(db).delete_todo(99999)

        assert result is False
