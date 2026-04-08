package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ryukitsushida/study-web-app/backend/gin/internal/handler"
	"github.com/ryukitsushida/study-web-app/backend/gin/internal/middleware"
	"github.com/ryukitsushida/study-web-app/backend/gin/internal/repository"
	"gorm.io/gorm"
)

// Setup はルーターを初期化して返す
func Setup(db *gorm.DB, allowedOrigins []string) *gin.Engine {
	r := gin.Default()

	// CORS ミドルウェア
	r.Use(middleware.CORS(allowedOrigins))

	// ヘルスチェック
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// TODO ルート
	todoRepo := repository.NewTodoRepository(db)
	todoHandler := handler.NewTodoHandler(todoRepo)

	todos := r.Group("/api/todos")
	{
		todos.GET("", todoHandler.GetAll)
		todos.GET("/:id", todoHandler.GetByID)
		todos.POST("", todoHandler.Create)
		todos.PATCH("/:id", todoHandler.Update)
		todos.DELETE("/:id", todoHandler.Delete)
	}

	return r
}
