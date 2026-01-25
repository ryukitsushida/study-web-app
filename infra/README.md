# Infrastructure (Terraform)

AWS ECS (Fargate) へのデプロイ用 Terraform コード

## 前提条件

- AWS CLI v2
- Terraform v1.10.0+（S3 native locking 使用）
- AWS アカウントと適切な権限

## AWS CLI のセットアップ

### 1. インストール

```bash
# macOS (Homebrew)
brew install awscli
```

### 2. 認証設定（SSO 推奨）

```bash
# SSO セッションの設定
aws configure sso

# ログイン
aws sso login --profile <your-profile-name>

# 環境変数でプロファイルを指定
export AWS_PROFILE=<your-profile-name>

# 確認
aws sts get-caller-identity
```

## Terraform のセットアップ

```bash
# macOS (Homebrew)
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# 確認
terraform --version
```

## フォルダ構成

```
infra/
├── 00-tfstate/     # Terraform state 管理用 S3（use_lockfile で lock）
├── 01-pre/         # 事前準備（ECR リポジトリ）
└── 02-main/        # メインインフラ（VPC, ECS, ALB）
```

## 環境管理

**workspace** で環境（dev/stg/prod）を切り替えます。

```bash
# workspace 一覧
terraform workspace list

# workspace 作成・切り替え
terraform workspace new dev
terraform workspace select dev

# 現在の workspace 確認
terraform workspace show
```

## デプロイ手順

### Step 0: Terraform State 管理用リソースの作成

```bash
cd infra/00-tfstate

terraform init
terraform plan
terraform apply

# 出力を確認（後続のステップで使用）
terraform output
```

### Step 1: ECR リポジトリの作成

```bash
cd ../01-pre

# backend 設定ファイルを作成
cat > backend.hcl << 'EOF'
bucket       = "<00-tfstate の s3_bucket_name>"
region       = "ap-northeast-1"
use_lockfile = true
encrypt      = true
EOF

# 初期化
terraform init -backend-config=backend.hcl

# workspace 作成
terraform workspace new dev

# 適用
terraform plan
terraform apply
```

### Step 2: Docker イメージのビルドとプッシュ

```bash
cd ../..

# ECR URL を取得（以下のいずれか）
# - AWS コンソール > ECR > study-web-app-api から URI をコピー
# - terraform output -raw ecr_repository_url
# 例: 123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/study-web-app-api

# ECR にログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com

# イメージをビルド
docker build -t study-web-app-api ./backend/fastapi

# タグ付け
docker tag study-web-app-api:latest <ECR_URL>:latest

# プッシュ
docker push <ECR_URL>:latest
```

### Step 3: ECS + RDS 環境の作成

```bash
cd infra/02-main

# backend 設定ファイルを作成（01-pre と同じ内容）
cat > backend.hcl << 'EOF'
bucket       = "<00-tfstate の s3_bucket_name>"
region       = "ap-northeast-1"
use_lockfile = true
encrypt      = true
EOF

# 初期化
terraform init -backend-config=backend.hcl

# workspace 作成（01-pre と同じ環境名）
terraform workspace new dev

# 必須変数を環境変数で設定
export TF_VAR_db_password="your-secure-password"

# オプション: HTTPS を使う場合（ドメインが必要）
# export TF_VAR_domain_name="api.example.com"
# export TF_VAR_hosted_zone_id="Z1234567890ABC"
# export TF_VAR_allowed_origins="https://your-app.vercel.app,http://localhost:3000"

# 適用（RDS + ECS が作成される）
terraform plan
terraform apply

# 確認
terraform output api_endpoint
terraform output rds_endpoint
```

## 環境ごとの設定

`02-main/main.tf` の `local.env_config` で環境ごとの設定を管理：

```hcl
env_config = {
  dev = {
    ecs_task_cpu      = 256
    ecs_task_memory   = 512
    ecs_desired_count = 1
  }
  stg = {
    ecs_task_cpu      = 256
    ecs_task_memory   = 512
    ecs_desired_count = 1
  }
  prod = {
    ecs_task_cpu      = 512
    ecs_task_memory   = 1024
    ecs_desired_count = 2
  }
}
```

## 変数の設定方法

tfvars ファイルは使用しません。変数は以下の方法で設定：

### 必須変数

```bash
# 環境変数で設定
export TF_VAR_db_password="your-secure-password"
```

### オプション変数

```bash
# HTTPS 使用時
export TF_VAR_domain_name="api.example.com"
export TF_VAR_hosted_zone_id="Z1234567890ABC"

# CORS 設定
export TF_VAR_allowed_origins="https://your-app.vercel.app,http://localhost:3000"

# イメージタグ（デフォルト: latest）
export TF_VAR_image_tag="latest"
```

**注意**:
- `DATABASE_URL` は RDS のエンドポイントから自動生成されます
- `ALLOWED_ORIGINS` はカンマ区切りで複数指定可能です
- `domain_name` を設定すると HTTPS が有効になり、ACM 証明書と Route53 レコードが自動作成されます

## 構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                            VPC                                   │
│                      (Flow Logs 有効)                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Public Subnets                          │  │
│  │  ┌─────────────────┐         ┌─────────────────┐         │  │
│  │  │  AZ-a           │         │  AZ-c           │         │  │
│  │  │  ┌───────────┐  │         │  ┌───────────┐  │         │  │
│  │  │  │ ECS Task  │  │         │  │ ECS Task  │  │         │  │
│  │  │  │ (Fargate) │  │         │  │ (Fargate) │  │         │  │
│  │  │  └───────────┘  │         │  └───────────┘  │         │  │
│  │  └────────┬────────┘         └────────┬────────┘         │  │
│  └───────────┼───────────────────────────┼───────────────────┘  │
│              │                           │                       │
│              ▼                           ▼                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Private Subnets                         │  │
│  │  ┌─────────────────┐         ┌─────────────────┐         │  │
│  │  │     RDS         │         │     RDS         │         │  │
│  │  │   (standby)     │◄───────►│   (primary)     │         │  │
│  │  └─────────────────┘         └─────────────────┘         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│                    ┌─────────────────┐                          │
│                    │       ALB       │                          │
│                    └─────────────────┘                          │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               ▼
                          Internet
```

## HTTPS の設定方法

### 前提条件

1. Route53 でドメインを管理している、または外部DNSでNSレコードをRoute53に向けている
2. ホストゾーン ID を確認済み

### 設定手順

```bash
# 1. ホストゾーン ID を確認
aws route53 list-hosted-zones

# 2. 変数を設定して apply
export TF_VAR_domain_name="api.example.com"
export TF_VAR_hosted_zone_id="Z1234567890ABC"
terraform apply
```

### 証明書の検証

ACM 証明書の DNS 検証は自動で行われますが、完了までに **5-10分** かかります。

```bash
# 証明書の状態確認
terraform output certificate_status
# ISSUED になれば完了
```

### アクセス

- HTTP: `http://api.example.com` → 自動的に HTTPS へリダイレクト
- HTTPS: `https://api.example.com`

## リソースの削除

```bash
# Step 1: メインインフラの削除
cd infra/02-main
terraform workspace select dev
terraform destroy

# Step 2: ECR リポジトリの削除
cd ../01-pre
terraform workspace select dev
terraform destroy

# Step 3: tfstate 管理リソースの削除（最後に実行）
cd ../00-tfstate
# prevent_destroy があるため手動対応が必要
```

## セキュリティ設定

- **S3 (tfstate)**: バージョニング、暗号化、パブリックアクセスブロック、HTTPSのみ
- **ECR**: IMMUTABLE タグ、脆弱性スキャン
- **VPC**: Flow Logs 有効化
- **ALB**: HTTP/2、不正ヘッダーのドロップ
- **ECS**: 読み取り専用FS、非特権モード、非rootユーザー
- **IAM**: 最小権限、Confused Deputy 対策

## コスト最適化

- NAT Gateway 不使用
- Container Insights 無効化
- CloudWatch Logs 14日保持
- S3 native locking（DynamoDB 不要）
