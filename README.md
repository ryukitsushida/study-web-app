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
├── infra/                       # Terraform (AWS)
│   ├── 00-tfstate/              # Terraform state 管理用 S3
│   ├── 01-pre/                  # 事前準備（ECR）
│   └── 02-main/                 # メインインフラ（VPC, ECS, ALB）
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
cd ../..
ECR_URL=$(cd infra/01-pre && terraform output -raw ecr_repository_url)
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin ${ECR_URL%/*}
docker build -t study-web-app-api ./backend/fastapi
docker tag study-web-app-api:latest ${ECR_URL}:v1.0.0
docker push ${ECR_URL}:v1.0.0

# 5. ECS + RDS 環境の作成
cd infra/02-main
terraform init -backend-config=backend.hcl
terraform workspace new dev
export TF_VAR_image_tag="v1.0.0"
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
