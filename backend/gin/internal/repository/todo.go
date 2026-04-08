package repository

import (
	"time"

	"github.com/ryukitsushida/study-web-app/backend/gin/internal/model"
	"gorm.io/gorm"
)

// TodoRepository は TODO の DB 操作を担当する
type TodoRepository struct {
	db *gorm.DB
}

// NewTodoRepository は新しい TodoRepository を作成する
func NewTodoRepository(db *gorm.DB) *TodoRepository {
	return &TodoRepository{db: db}
}

// FindAll は全ての TODO を作成日時の降順で取得する
func (r *TodoRepository) FindAll() ([]model.Todo, error) {
	var todos []model.Todo
	result := r.db.Order("created_at DESC, id DESC").Find(&todos)
	return todos, result.Error
}

// FindByID は指定 ID の TODO を取得する
func (r *TodoRepository) FindByID(id int) (*model.Todo, error) {
	var todo model.Todo
	result := r.db.First(&todo, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &todo, nil
}

// Create は新しい TODO を作成する
func (r *TodoRepository) Create(todo *model.Todo) error {
	return r.db.Create(todo).Error
}

// Update は既存の TODO を更新する
func (r *TodoRepository) Update(todo *model.Todo, updates map[string]interface{}) error {
	updates["updated_at"] = time.Now().UTC()
	result := r.db.Model(todo).Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	// 更新後のデータを再読み込み
	return r.db.First(todo, todo.ID).Error
}

// Delete は指定 ID の TODO を削除する
func (r *TodoRepository) Delete(id int) error {
	return r.db.Delete(&model.Todo{}, id).Error
}
