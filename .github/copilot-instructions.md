# Copilot Instructions

## リポジトリ概要

このリポジトリは、Web開発勉強用のWebアプリです。  
Webアプリとしてのゴールはなく、色々な機能を実装して学習することを目的としています。  
バックエンドは複数フレームワーク（FastAPI, Hono 等）で同一 API を実装し、比較学習しています。

## 記述ルール

- すべてのレビューコメント・提案・説明は日本語で記述してください。
- 指摘の際は具体的な理由と簡潔な改善案を添えてください。
- 可能な限り簡潔にまとめ、敬体で記載してください。

## 領域別 Instructions

各領域の詳細な指示は以下のファイルに分割しています。

### Frontend

- `.github/instructions/frontend.instructions.md` → `frontend/**`

### Backend (FastAPI)

- `.github/instructions/backend-fastapi.instructions.md` → `backend/fastapi/**`

### Backend (Hono)

- `.github/instructions/backend-hono.instructions.md` → `backend/hono/**`

### Infrastructure

- `.github/instructions/infra.instructions.md` → `infra/**`

## 禁止事項

### 機密情報の取り扱い

- `.env`、`.env.local`、`.env.production` 等の環境変数ファイルは**絶対にコミットしない**
- APIキー、DBパスワード、AWSクレデンシャル、シークレットトークン等の機密値をソースコードにハードコードしない
- `terraform.tfvars` や `backend.hcl` 等の Terraform 変数ファイルをコミットしない

### セキュリティ

- SQLクエリの文字列結合・フォーマットによる組み立てを行わない（SQLAlchemy のパラメータバインドや Prisma のクエリビルダーを使う）
- ユーザー入力をサニタイズせずにHTMLへ直接埋め込まない（XSS対策）
- CORS の `allow_origins` に `"*"` を本番環境で設定しない
- AWS セキュリティグループで `0.0.0.0/0` への不要なポート開放をしない
- RDS やその他データストアをパブリックサブネットに配置しない
- S3 バケットのパブリックアクセスを有効にしない
- IAM ポリシーで `"Action": "*"` や `"Resource": "*"` を使わない（最小権限の原則）
- HTTP（非TLS）で本番トラフィックを流さない
- `--no-verify`、`--force` 等の安全チェックを迂回するオプションを使わない
