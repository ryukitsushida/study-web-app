package config

import (
	"fmt"
	"os"
	"strings"
)

// Config はアプリケーション設定を保持する
type Config struct {
	DatabaseURL    string
	Port           string
	AllowedOrigins []string
}

// Load は環境変数から設定を読み込む
func Load() *Config {
	return &Config{
		DatabaseURL:    getEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/todo_db"),
		Port:           getEnv("PORT", "8002"),
		AllowedOrigins: getEnvSlice("ALLOWED_ORIGINS", []string{"http://localhost:3000"}),
	}
}

// DSN は GORM 用の PostgreSQL DSN を返す
// DATABASE_URL の形式: postgresql://user:pass@host:port/dbname → host=... user=... password=... dbname=... port=... sslmode=disable
func (c *Config) DSN() string {
	url := c.DatabaseURL

	// postgresql:// または postgres:// プレフィックスを処理
	for _, prefix := range []string{"postgresql://", "postgres://"} {
		if strings.HasPrefix(url, prefix) {
			url = strings.TrimPrefix(url, prefix)
			return parseDSN(url)
		}
	}

	// すでに DSN 形式の場合はそのまま返す
	return url
}

func parseDSN(url string) string {
	// user:pass@host:port/dbname?params
	var user, password, host, port, dbname string

	// user:pass@rest
	atIdx := strings.LastIndex(url, "@")
	if atIdx >= 0 {
		userPart := url[:atIdx]
		url = url[atIdx+1:]
		if colonIdx := strings.Index(userPart, ":"); colonIdx >= 0 {
			user = userPart[:colonIdx]
			password = userPart[colonIdx+1:]
		} else {
			user = userPart
		}
	}

	// host:port/dbname
	slashIdx := strings.Index(url, "/")
	if slashIdx >= 0 {
		hostPart := url[:slashIdx]
		dbname = url[slashIdx+1:]
		// クエリパラメータを除去
		if qIdx := strings.Index(dbname, "?"); qIdx >= 0 {
			dbname = dbname[:qIdx]
		}
		if colonIdx := strings.Index(hostPart, ":"); colonIdx >= 0 {
			host = hostPart[:colonIdx]
			port = hostPart[colonIdx+1:]
		} else {
			host = hostPart
			port = "5432"
		}
	}

	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host, user, password, dbname, port)
}

func getEnv(key, defaultValue string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultValue
}

func getEnvSlice(key string, defaultValue []string) []string {
	if v := os.Getenv(key); v != "" {
		parts := strings.Split(v, ",")
		result := make([]string, 0, len(parts))
		for _, p := range parts {
			if trimmed := strings.TrimSpace(p); trimmed != "" {
				result = append(result, trimmed)
			}
		}
		return result
	}
	return defaultValue
}
