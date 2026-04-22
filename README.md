# TODO App

シンプルな CRUD 操作のある TODO アプリケーション

## 技術スタック

### フロントエンド

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- ESLint + Prettier
- Jest + React Testing Library（テスト）

### バックエンド（FastAPI）

- FastAPI
- SQLAlchemy 2.0 (async)
- Alembic (DB マイグレーション)
- Ruff (リンター/フォーマッター)

### バックエンド（Hono）

- Hono
- Prisma 7 (ORM / @prisma/adapter-pg)
- Zod (バリデーション)
- Vitest (テスト)

### データベース

- PostgreSQL 16（FastAPI / Hono で共有）

## 開発環境のセットアップ

### 必要な環境

- Node.js 20.9.0+
- Python 3.13+
- Docker & Docker Compose

### 1. バックエンド + DB の起動

Docker Compose の **profiles** で、起動するバックエンドを選択します。

FastAPI と Hono は **同じポート（8000）** で動かす想定のため、バックエンドは **どちらか片方だけ** 起動してください。

```bash
# FastAPI で起動
docker compose --profile fastapi up -d

# Hono で起動
docker compose --profile hono up -d

# 停止
docker compose --profile fastapi down
docker compose --profile hono down
```

切り替える場合は、先に起動中のバックエンドを停止してからもう一方を起動してください（ポート 8000 が衝突します）。

> **NOTE:** DB は常に起動します。FastAPI と Hono は同じ PostgreSQL（todo_db）を共有します。

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

フロントエンドの接続先を切り替えるには `.env.local` の `NEXT_PUBLIC_API_URL` を変更します。

```bash
# FastAPI / Hono のどちらに接続する場合でも同じ
# （起動しているバックエンドが http://localhost:8000 で待ち受けます）
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. アクセス

| サービス             | URL                        |
| -------------------- | -------------------------- |
| フロントエンド       | http://localhost:3000      |
| FastAPI / Hono API   | http://localhost:8000      |
| FastAPI ドキュメント | http://localhost:8000/docs |

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

# テスト
npm test

# テスト（ウォッチモード）
npm run test:watch

# テスト（カバレッジ）
npm run test:coverage
```

### バックエンド（FastAPI）

```bash
cd backend/fastapi

# リント & フォーマット
ruff check --fix .
ruff format .

# マイグレーションファイルの作成
alembic revision --autogenerate -m "description"

# マイグレーションの実行
alembic upgrade head

# テスト（Docker 起動が必要）
python -m pytest tests/ -v
```

### バックエンド（Hono）

```bash
cd backend/hono

# 依存パッケージのインストール（postinstall で prisma generate が自動実行されます）
npm install

# ローカル開発サーバー（ホットリロード）
npm run dev

# Prisma Client 生成（prisma/schema.prisma 変更後）
npm run prisma:generate

# 既存 DB からスキーマを取得
npm run prisma:pull

# テスト（Docker 起動が必要）
npm test

# 型チェック
npm run typecheck
```

> **NOTE:** DB マイグレーションは FastAPI 側の Alembic で管理します。
> Hono 側でスキーマ変更を反映するには `npm run prisma:pull && npm run prisma:generate` を実行してください。

## プロジェクト構造

```
.
├── backend/
│   ├── fastapi/
│   │   ├── app/
│   │   │   ├── main.py          # FastAPIアプリケーション
│   │   │   ├── database.py      # DB接続
│   │   │   ├── core/
│   │   │   │   └── config.py    # 設定
│   │   │   ├── crud/
│   │   │   │   └── todo.py      # DB操作
│   │   │   ├── exceptions/      # 例外定義
│   │   │   ├── models/
│   │   │   │   └── models.py    # SQLAlchemyモデル
│   │   │   ├── routers/
│   │   │   │   └── todos.py     # TODOエンドポイント
│   │   │   ├── schemas/
│   │   │   │   └── todo/        # Pydanticスキーマ
│   │   │   └── services/
│   │   │       └── todo.py      # ビジネスロジック
│   │   ├── tests/               # テスト (Testcontainers PostgreSQL)
│   │   ├── alembic/             # マイグレーション
│   │   └── Dockerfile
│   └── hono/
│       ├── src/
│       │   ├── app.ts           # Hono app ファクトリ（CORS, ルート登録）
│       │   ├── index.ts         # サーバー起動
│       │   ├── db.ts            # Prisma Client (adapter-pg)
│       │   ├── env.ts           # 環境変数
│       │   ├── errors.ts        # カスタムエラー
│       │   ├── routes/
│       │   │   └── todos.ts     # TODO ルート + ハンドラ
│       │   ├── middleware/
│       │   │   └── error-handler.ts
│       │   └── schemas/
│       │       └── todo.ts      # Zod スキーマ
│       ├── tests/               # テスト (Vitest + Testcontainers)
│       ├── prisma/
│       │   └── schema.prisma
│       └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   ├── components/          # Reactコンポーネント
│   │   ├── lib/                 # API クライアント
│   │   └── types/               # TypeScript型定義
│   └── eslint.config.mjs
├── infra/                       # Terraform (AWS)
│   ├── 00-tfstate/              # Terraform state 管理用 S3
│   ├── 01-pre/                  # 事前準備（ECR）
│   └── 02-main/                 # メインインフラ（VPC, ECS, ALB）
├── docker-compose.yml           # profiles: fastapi / hono
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

Terraform を使用して AWS ECS (Fargate) にデプロイします。
詳細な手順は [infra/README.md](./infra/README.md) を参照してください。

#### クイックスタート

```bash
# 1. AWS CLI の認証（SSO推奨）
aws sso login --profile <your-profile>
export AWS_PROFILE=<your-profile>

# 2. Terraform state 管理用リソースの作成
cd infra/00-tfstate
terraform init && terraform apply

# 3. ECR リポジトリの作成
cd ../01-pre
# backend.hcl を作成（00-tfstate の出力値を設定）
terraform init -backend-config=backend.hcl
terraform workspace new dev && terraform apply

# 4. Docker イメージのビルドとプッシュ
# ECR_URL は AWS コンソール > ECR > study-web-app-api からコピー
# 例: 123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/study-web-app-api
cd ../..
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com
docker build -t study-web-app-api ./backend/fastapi
docker tag study-web-app-api:latest <ECR_URL>:latest
docker push <ECR_URL>:latest

# 5. ECS + RDS 環境の作成
cd infra/02-main
terraform init -backend-config=backend.hcl
terraform workspace new dev
export TF_VAR_db_password="your-secure-password"
terraform apply

# 確認
terraform output api_endpoint
terraform output rds_endpoint
```

#### 構成の特徴

- S3 で tfstate 管理（native locking）
- NAT Gateway 不使用（コスト削減）
- Fargate でサーバーレス運用
- ALB でロードバランシング
- RDS PostgreSQL（プライベートサブネット）
- VPC Flow Logs / CloudWatch Logs でログ管理
- セキュリティ強化（IMMUTABLE タグ、読み取り専用FS、非root実行）
