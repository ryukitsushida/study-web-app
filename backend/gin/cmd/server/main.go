package main

import (
	"fmt"
	"log"

	"github.com/ryukitsushida/study-web-app/backend/gin/internal/config"
	"github.com/ryukitsushida/study-web-app/backend/gin/internal/model"
	"github.com/ryukitsushida/study-web-app/backend/gin/internal/router"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()

	// DB 接続
	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// テーブルのマイグレーション（開発用）
	// 本番では Alembic（FastAPI 側）がスキーマ管理の単一ソース
	if err := db.AutoMigrate(&model.Todo{}); err != nil {
		log.Fatalf("Failed to auto-migrate: %v", err)
	}

	r := router.Setup(db, cfg.AllowedOrigins)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Gin server running on http://localhost:%s", cfg.Port)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
