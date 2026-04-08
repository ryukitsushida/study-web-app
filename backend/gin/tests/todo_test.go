package tests

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/ryukitsushida/study-web-app/backend/gin/internal/model"
	"github.com/ryukitsushida/study-web-app/backend/gin/internal/router"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
	gormPg "gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var testDB *gorm.DB

func setupTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	ctx := context.Background()

	pgContainer, err := postgres.Run(ctx,
		"postgres:16-alpine",
		postgres.WithDatabase("todo_db"),
		postgres.WithUsername("postgres"),
		postgres.WithPassword("postgres"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(30*time.Second),
		),
	)
	require.NoError(t, err)

	t.Cleanup(func() {
		require.NoError(t, pgContainer.Terminate(ctx))
	})

	connStr, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
	require.NoError(t, err)

	db, err := gorm.Open(gormPg.Open(connStr), &gorm.Config{})
	require.NoError(t, err)

	// テーブルを作成（Alembic と同じスキーマ）
	err = db.Exec(`
		CREATE TABLE IF NOT EXISTS todos (
			id SERIAL PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			description TEXT,
			completed BOOLEAN NOT NULL DEFAULT false,
			created_at TIMESTAMP(6) NOT NULL DEFAULT now(),
			updated_at TIMESTAMP(6) NOT NULL DEFAULT now()
		)
	`).Error
	require.NoError(t, err)

	err = db.Exec(`CREATE INDEX IF NOT EXISTS ix_todos_id ON todos (id)`).Error
	require.NoError(t, err)

	return db
}

func cleanupTodos(t *testing.T, db *gorm.DB) {
	t.Helper()
	db.Exec("DELETE FROM todos")
	db.Exec("ALTER SEQUENCE todos_id_seq RESTART WITH 1")
}

func createTestTodo(t *testing.T, db *gorm.DB, title string, description *string) model.Todo {
	t.Helper()
	todo := model.Todo{
		Title:       title,
		Description: description,
	}
	err := db.Create(&todo).Error
	require.NoError(t, err)
	return todo
}

func strPtr(s string) *string {
	return &s
}

func TestMain(m *testing.M) {
	m.Run()
}

func TestHealthCheck(t *testing.T) {
	db := setupTestDB(t)
	r := router.Setup(db, []string{"http://localhost:3000"})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/health", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"status":"ok"`)
}

func TestCreateTodo(t *testing.T) {
	db := setupTestDB(t)
	r := router.Setup(db, []string{"http://localhost:3000"})

	t.Run("タイトルのみで作成", func(t *testing.T) {
		cleanupTodos(t, db)

		body := `{"title":"Test Todo"}`
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/todos", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		assert.Contains(t, w.Body.String(), `"title":"Test Todo"`)
		assert.Contains(t, w.Body.String(), `"completed":false`)
		assert.Contains(t, w.Body.String(), `"description":null`)
	})

	t.Run("説明付きで作成", func(t *testing.T) {
		cleanupTodos(t, db)

		body := `{"title":"Test Todo","description":"A description"}`
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/todos", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		assert.Contains(t, w.Body.String(), `"title":"Test Todo"`)
		assert.Contains(t, w.Body.String(), `"description":"A description"`)
	})

	t.Run("タイトル未指定でバリデーションエラー", func(t *testing.T) {
		body := `{}`
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/todos", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("空タイトルでバリデーションエラー", func(t *testing.T) {
		body := `{"title":""}`
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/todos", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestGetAllTodos(t *testing.T) {
	db := setupTestDB(t)
	r := router.Setup(db, []string{"http://localhost:3000"})

	t.Run("空リストを返す", func(t *testing.T) {
		cleanupTodos(t, db)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/todos", nil)
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, "[]", w.Body.String())
	})

	t.Run("作成日時の降順で返す", func(t *testing.T) {
		cleanupTodos(t, db)

		createTestTodo(t, db, "First", nil)
		time.Sleep(10 * time.Millisecond)
		createTestTodo(t, db, "Second", nil)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/todos", nil)
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		// Second が最初に来ること（降順）
		body := w.Body.String()
		secondIdx := strings.Index(body, "Second")
		firstIdx := strings.Index(body, "First")
		assert.True(t, secondIdx < firstIdx, "Second should appear before First in descending order")
	})
}

func TestGetTodoByID(t *testing.T) {
	db := setupTestDB(t)
	r := router.Setup(db, []string{"http://localhost:3000"})

	t.Run("指定IDのTODOを返す", func(t *testing.T) {
		cleanupTodos(t, db)

		todo := createTestTodo(t, db, "Test", strPtr("Desc"))

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", fmt.Sprintf("/api/todos/%d", todo.ID), nil)
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), `"title":"Test"`)
		assert.Contains(t, w.Body.String(), `"description":"Desc"`)
	})

	t.Run("存在しないIDで404", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/todos/99999", nil)
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
		assert.Contains(t, w.Body.String(), "not found")
	})
}

func TestUpdateTodo(t *testing.T) {
	db := setupTestDB(t)
	r := router.Setup(db, []string{"http://localhost:3000"})

	t.Run("タイトルを更新", func(t *testing.T) {
		cleanupTodos(t, db)

		todo := createTestTodo(t, db, "Original", nil)

		body := `{"title":"Updated"}`
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("PATCH", fmt.Sprintf("/api/todos/%d", todo.ID), strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), `"title":"Updated"`)
	})

	t.Run("completed を更新", func(t *testing.T) {
		cleanupTodos(t, db)

		todo := createTestTodo(t, db, "Test", nil)

		body := `{"completed":true}`
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("PATCH", fmt.Sprintf("/api/todos/%d", todo.ID), strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), `"completed":true`)
	})

	t.Run("存在しないIDで404", func(t *testing.T) {
		body := `{"title":"Updated"}`
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("PATCH", "/api/todos/99999", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}

func TestDeleteTodo(t *testing.T) {
	db := setupTestDB(t)
	r := router.Setup(db, []string{"http://localhost:3000"})

	t.Run("TODOを削除", func(t *testing.T) {
		cleanupTodos(t, db)

		todo := createTestTodo(t, db, "To Delete", nil)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("DELETE", fmt.Sprintf("/api/todos/%d", todo.ID), nil)
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNoContent, w.Code)

		// 削除されたことを確認
		w2 := httptest.NewRecorder()
		req2, _ := http.NewRequest("GET", fmt.Sprintf("/api/todos/%d", todo.ID), nil)
		r.ServeHTTP(w2, req2)
		assert.Equal(t, http.StatusNotFound, w2.Code)
	})

	t.Run("存在しないIDで404", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("DELETE", "/api/todos/99999", nil)
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}
