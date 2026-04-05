from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import TodoCRUD


class TestTodoCRUDCreate:
    async def test_create(self, db_session: AsyncSession):
        crud = TodoCRUD(db_session)
        todo = await crud.create({"title": "テストタスク", "description": "説明文"})

        assert todo.id is not None
        assert todo.title == "テストタスク"
        assert todo.description == "説明文"
        assert todo.completed is False
        assert todo.created_at is not None
        assert todo.updated_at is not None

    async def test_create_without_description(self, db_session: AsyncSession):
        crud = TodoCRUD(db_session)
        todo = await crud.create({"title": "説明なしタスク"})

        assert todo.title == "説明なしタスク"
        assert todo.description is None


class TestTodoCRUDGetList:
    async def test_get_list(self, db_session: AsyncSession):
        crud = TodoCRUD(db_session)
        await crud.create({"title": "タスク1"})
        await crud.create({"title": "タスク2"})
        await crud.create({"title": "タスク3"})

        todos = await crud.get_list()

        assert len(todos) == 3
        # created_at DESC, id DESC で返却されることを確認
        assert todos[0].title == "タスク3"
        assert todos[1].title == "タスク2"
        assert todos[2].title == "タスク1"

    async def test_get_list_empty(self, db_session: AsyncSession):
        crud = TodoCRUD(db_session)
        todos = await crud.get_list()

        assert todos == []


class TestTodoCRUDGetById:
    async def test_get_by_id(self, db_session: AsyncSession):
        crud = TodoCRUD(db_session)
        created = await crud.create({"title": "取得テスト"})

        todo = await crud.get_by_id(created.id)

        assert todo is not None
        assert todo.id == created.id
        assert todo.title == "取得テスト"

    async def test_get_by_id_not_found(self, db_session: AsyncSession):
        crud = TodoCRUD(db_session)
        todo = await crud.get_by_id(99999)

        assert todo is None


class TestTodoCRUDUpdate:
    async def test_update(self, db_session: AsyncSession):
        crud = TodoCRUD(db_session)
        created = await crud.create({"title": "更新前", "description": "更新前の説明"})

        updated = await crud.update(created.id, {"title": "更新後", "completed": True})

        assert updated is not None
        assert updated.title == "更新後"
        assert updated.completed is True
        # 更新していないフィールドは元の値を保持
        assert updated.description == "更新前の説明"

    async def test_update_not_found(self, db_session: AsyncSession):
        crud = TodoCRUD(db_session)
        result = await crud.update(99999, {"title": "存在しない"})

        assert result is None


class TestTodoCRUDDelete:
    async def test_delete(self, db_session: AsyncSession):
        crud = TodoCRUD(db_session)
        created = await crud.create({"title": "削除テスト"})

        result = await crud.delete(created.id)

        assert result is True
        # 削除後に取得できないことを確認
        assert await crud.get_by_id(created.id) is None

    async def test_delete_not_found(self, db_session: AsyncSession):
        crud = TodoCRUD(db_session)
        result = await crud.delete(99999)

        assert result is False
