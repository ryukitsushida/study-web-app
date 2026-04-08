package model

import (
	"time"
)

// Todo はデータベースの todos テーブルに対応するモデル
type Todo struct {
	ID          int       `gorm:"primaryKey;autoIncrement" json:"id"`
	Title       string    `gorm:"type:varchar(255);not null" json:"title"`
	Description *string   `gorm:"type:text" json:"description"`
	Completed   bool      `gorm:"not null;default:false" json:"completed"`
	CreatedAt   time.Time `gorm:"column:created_at;type:timestamp(6);not null;autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at;type:timestamp(6);not null;autoUpdateTime" json:"updated_at"`
}

// TableName はテーブル名を指定する
func (Todo) TableName() string {
	return "todos"
}

// TodoResponse は API レスポンス用の構造体（DateTime を ISO 8601 文字列で返す）
type TodoResponse struct {
	ID          int     `json:"id"`
	Title       string  `json:"title"`
	Description *string `json:"description"`
	Completed   bool    `json:"completed"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}

// ToResponse は Todo モデルを API レスポンス形式に変換する
func (t *Todo) ToResponse() TodoResponse {
	return TodoResponse{
		ID:          t.ID,
		Title:       t.Title,
		Description: t.Description,
		Completed:   t.Completed,
		CreatedAt:   t.CreatedAt.UTC().Format(time.RFC3339Nano),
		UpdatedAt:   t.UpdatedAt.UTC().Format(time.RFC3339Nano),
	}
}

// CreateTodoRequest は TODO 作成リクエストのバリデーション用構造体
type CreateTodoRequest struct {
	Title       string  `json:"title" binding:"required,min=1,max=255"`
	Description *string `json:"description" binding:"omitempty,max=1024"`
}

// UpdateTodoRequest は TODO 更新リクエストのバリデーション用構造体
type UpdateTodoRequest struct {
	Title       *string `json:"title" binding:"omitempty,min=1,max=255"`
	Description *string `json:"description" binding:"omitempty,max=1024"`
	Completed   *bool   `json:"completed"`
}
