---
applyTo: "backend/gin/**"
---

# Backend (Gin) 指示

## ① 技術スタック

| カテゴリ       | 技術                         | バージョン |
| -------------- | ---------------------------- | ---------- |
| 言語           | Go                           | ≥ 1.24     |
| フレームワーク | Gin                          | 1.x        |
| ORM            | GORM + gorm/driver/postgres  | 1.x        |
| バリデーション | go-playground/validator (Gin 内蔵) | 10.x |
| CORS           | gin-contrib/cors             | 1.x        |
| テスト         | testing + testcontainers-go  | -          |

## ② ディレクトリ構成

```
backend/gin/
├── cmd/
│   └── server/
│       └── main.go            # サーバー起動エントリポイント
├── internal/
│   ├── config/
│   │   └── config.go          # 環境変数管理
│   ├── handler/
│   │   └── todo.go            # HTTP ハンドラ（Gin ハンドラ）
│   ├── middleware/
│   │   └── cors.go            # CORS ミドルウェア
│   ├── model/
│   │   └── todo.go            # DB モデル + リクエスト/レスポンス型
│   ├── repository/
│   │   └── todo.go            # DB 操作（CRUD）
│   └── router/
│       └── router.go          # ルート定義
├── tests/
│   └── todo_test.go           # 統合テスト（Testcontainers PostgreSQL）
├── Dockerfile
├── go.mod
├── go.sum
├── .env.example
├── .gitignore
└── .dockerignore
```

## ③ アーキテクチャ・設計指針

### Go ベストプラクティスに準拠

- **Standard Go Project Layout**: `cmd/` でエントリポイント、`internal/` でプライベートパッケージを管理
- **Handler → Repository の 2 層構造**: Hono と同様にシンプルな構成（Service 層は設けない）
- **GORM による DB 操作**: PostgreSQL ドライバで直接操作

### DB マイグレーション

- **Alembic（FastAPI 側）がスキーマ管理の単一ソース**
- GORM の `AutoMigrate` は開発・テスト用のみ使用
- 本番では Alembic マイグレーションに依存する

### バリデーション

- Gin 内蔵の `binding` タグで行う（go-playground/validator）
- title: 1〜255 文字（`binding:"required,min=1,max=255"`）
- description: 最大 1024 文字（`binding:"omitempty,max=1024"`）

### エラーハンドリング

- GORM の `gorm.ErrRecordNotFound` で 404 を判定
- `{ "detail": "メッセージ" }` 形式の JSON エラーレスポンス（他バックエンドと統一）

### レスポンス形式

- FastAPI / Hono と同一の JSON フィールド名・型を使用する（フロントエンド互換性のため）
- DateTime は ISO 8601（`time.RFC3339Nano`）で返す

## ④ コーディング規約

- **Go 標準のフォーマット**: `gofmt` / `goimports` を使用
- パッケージ名: **小文字単語**（`handler`, `model`, `repository`）
- ファイル名: **snake_case**（`todo.go`, `config.go`）
- 構造体名・関数名: **PascalCase**（エクスポート）/ **camelCase**（非エクスポート）
- 環境変数は `config.Load()` で一元管理し、直接 `os.Getenv` を参照しない

## ⑤ テスト方針

- **テストフレームワーク**: Go 標準 `testing` + `testify` + `testcontainers-go`
- **統合テスト中心**: `router.Setup(testDB)` で実 DB と接続した Gin router を生成し、`httptest` でエンドポイントをテスト
- テスト内で直接 GORM を操作してデータのセットアップ・検証を行う
- テストファイルは `tests/` に配置
- **テスト実行**: `cd backend/gin && go test ./tests/ -v -timeout 120s`
