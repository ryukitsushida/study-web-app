from httpx import AsyncClient


class TestGetTodos:
    async def test_get_todos_empty(self, client: AsyncClient):
        response = await client.get("/api/todos")

        assert response.status_code == 200
        assert response.json() == []

    async def test_get_todos(self, client: AsyncClient):
        await client.post("/api/todos", json={"title": "タスク1"})
        await client.post("/api/todos", json={"title": "タスク2"})

        response = await client.get("/api/todos")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2


class TestGetTodo:
    async def test_get_todo(self, client: AsyncClient):
        create_response = await client.post(
            "/api/todos", json={"title": "取得テスト", "description": "説明"}
        )
        todo_id = create_response.json()["id"]

        response = await client.get(f"/api/todos/{todo_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == todo_id
        assert data["title"] == "取得テスト"
        assert data["description"] == "説明"
        assert data["completed"] is False

    async def test_get_todo_not_found(self, client: AsyncClient):
        response = await client.get("/api/todos/99999")

        assert response.status_code == 404
        assert response.json()["detail"] == "TODO not found"


class TestCreateTodo:
    async def test_create_todo(self, client: AsyncClient):
        response = await client.post(
            "/api/todos", json={"title": "新規タスク", "description": "説明文"}
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "新規タスク"
        assert data["description"] == "説明文"
        assert data["completed"] is False
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    async def test_create_todo_without_description(self, client: AsyncClient):
        response = await client.post("/api/todos", json={"title": "説明なし"})

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "説明なし"
        assert data["description"] is None

    async def test_create_todo_empty_title(self, client: AsyncClient):
        response = await client.post("/api/todos", json={"title": ""})

        assert response.status_code == 422

    async def test_create_todo_missing_title(self, client: AsyncClient):
        response = await client.post("/api/todos", json={})

        assert response.status_code == 422

    async def test_create_todo_title_too_long(self, client: AsyncClient):
        response = await client.post("/api/todos", json={"title": "a" * 256})

        assert response.status_code == 422


class TestUpdateTodo:
    async def test_update_todo(self, client: AsyncClient):
        create_response = await client.post(
            "/api/todos", json={"title": "更新前", "description": "元の説明"}
        )
        todo_id = create_response.json()["id"]

        response = await client.patch(
            f"/api/todos/{todo_id}",
            json={"title": "更新後", "completed": True},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "更新後"
        assert data["completed"] is True
        assert data["description"] == "元の説明"

    async def test_update_todo_partial(self, client: AsyncClient):
        create_response = await client.post(
            "/api/todos", json={"title": "部分更新テスト"}
        )
        todo_id = create_response.json()["id"]

        response = await client.patch(f"/api/todos/{todo_id}", json={"completed": True})

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "部分更新テスト"
        assert data["completed"] is True

    async def test_update_todo_not_found(self, client: AsyncClient):
        response = await client.patch("/api/todos/99999", json={"title": "存在しない"})

        assert response.status_code == 404
        assert response.json()["detail"] == "TODO not found"

    async def test_update_todo_invalid_title(self, client: AsyncClient):
        create_response = await client.post(
            "/api/todos", json={"title": "バリデーションテスト"}
        )
        todo_id = create_response.json()["id"]

        response = await client.patch(f"/api/todos/{todo_id}", json={"title": ""})

        assert response.status_code == 422


class TestDeleteTodo:
    async def test_delete_todo(self, client: AsyncClient):
        create_response = await client.post("/api/todos", json={"title": "削除テスト"})
        todo_id = create_response.json()["id"]

        response = await client.delete(f"/api/todos/{todo_id}")

        assert response.status_code == 204

        # 削除後に取得できないことを確認
        get_response = await client.get(f"/api/todos/{todo_id}")
        assert get_response.status_code == 404

    async def test_delete_todo_not_found(self, client: AsyncClient):
        response = await client.delete("/api/todos/99999")

        assert response.status_code == 404
        assert response.json()["detail"] == "TODO not found"
