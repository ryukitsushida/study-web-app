# TODO App

シンプルなCRUD操作のあるTODOアプリケーション

## 技術スタック

### フロントエンド

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- ESLint + Prettier

### バックエンド

- FastAPI
- SQLAlchemy 2.0
- Alembic (DBマイグレーション)
- Ruff (リンター/フォーマッター)

### データベース

- PostgreSQL 16

## 開発環境のセットアップ

### 必要な環境

- Node.js 18+
- Python 3.12+
- Docker & Docker Compose

### 1. バックエンド + DB の起動

```bash
# Docker Composeでバックエンドとデータベースを起動
docker compose up -d

# マイグレーションの実行（初回のみ）
docker compose exec api alembic upgrade head
```

### 2. フロントエンドの起動

```bash
cd frontend

# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.local.example .env.local

# 開発サーバーの起動
npm run dev
```

### 3. アクセス

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000
- API ドキュメント: http://localhost:8000/docs

## 開発コマンド

### フロントエンド

```bash
cd frontend

# 開発サーバー
npm run dev

# リント
npm run lint

# フォーマット
npx prettier --write .
```

### バックエンド

```bash
cd backend/fastapi

# リント & フォーマット
ruff check --fix .
ruff format .

# マイグレーションファイルの作成
alembic revision --autogenerate -m "description"

# マイグレーションの実行
alembic upgrade head
```

## プロジェクト構造

```
.
├── backend/
│   └── fastapi/
│       ├── app/
│       │   ├── main.py          # FastAPIアプリケーション
│       │   ├── config.py        # 設定
│       │   ├── database.py      # DB接続
│       │   ├── models.py        # SQLAlchemyモデル
│       │   ├── schemas.py       # Pydanticスキーマ
│       │   └── routers/
│       │       └── todos.py     # TODOエンドポイント
│       ├── alembic/             # マイグレーション
│       ├── Dockerfile           # ECSデプロイ用
│       ├── requirements.txt
│       └── pyproject.toml       # Ruff設定
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   ├── components/          # Reactコンポーネント
│   │   ├── lib/                 # API クライアント
│   │   └── types/               # TypeScript型定義
│   ├── .prettierrc
│   └── eslint.config.mjs
├── docker-compose.yml           # バックエンド + DB
├── .vscode/                     # エディタ設定
└── README.md
```

## API エンドポイント

| Method | Endpoint        | 説明           |
| ------ | --------------- | -------------- |
| GET    | /api/todos      | 全TODO取得     |
| GET    | /api/todos/{id} | TODO取得       |
| POST   | /api/todos      | TODO作成       |
| PATCH  | /api/todos/{id} | TODO更新       |
| DELETE | /api/todos/{id} | TODO削除       |
| GET    | /health         | ヘルスチェック |

## デプロイ

### バックエンド (ECS)

Dockerfileは本番環境（ECS）向けに最適化されています：

- マルチステージビルド不要（Pythonのため）
- 非rootユーザーで実行
- ヘルスチェック設定済み

```bash
# イメージのビルド
docker build -t todo-api ./backend/fastapi

# ECRへプッシュ（例）
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker tag todo-api:latest <account>.dkr.ecr.<region>.amazonaws.com/todo-api:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/todo-api:latest
```
