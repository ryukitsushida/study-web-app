# Copilot Instructions

## リポジトリ概要

このリポジトリは、Web開発勉強用のWebアプリです。  
Webアプリとしてのゴールはなく、色々な機能を実装して学習することを目的としています。  
現在バックエンドはFastAPIを使用していますが、将来的にはGoやRustなど他の言語も試す予定です。

## 領域別 Instructions

各領域の詳細な指示は以下のファイルに分割しています。

### Frontend

- `.github/instructions/frontend.instructions.md` → `frontend/**`

### Backend

- `.github/instructions/backend.instructions.md` → `backend/**`

### Infrastructure

- `.github/instructions/infra.instructions.md` → `infra/**`

## 禁止事項

### 機密情報の取り扱い

- `.env`、`.env.local`、`.env.production` 等の環境変数ファイルは**絶対にコミットしない**
- APIキー、DBパスワード、AWSクレデンシャル、シークレットトークン等の機密値をソースコードにハードコードしない
- `terraform.tfvars` や `backend.hcl` 等の Terraform 変数ファイルをコミットしない

### セキュリティ

- SQLクエリの文字列結合・フォーマットによる組み立てを行わない（SQLAlchemy のパラメータバインドを使う）
- ユーザー入力をサニタイズせずにHTMLへ直接埋め込まない（XSS対策）
- CORS の `allow_origins` に `"*"` を本番環境で設定しない
- AWS セキュリティグループで `0.0.0.0/0` への不要なポート開放をしない
- RDS やその他データストアをパブリックサブネットに配置しない
- S3 バケットのパブリックアクセスを有効にしない
- IAM ポリシーで `"Action": "*"` や `"Resource": "*"` を使わない（最小権限の原則）
- HTTP（非TLS）で本番トラフィックを流さない
- `--no-verify`、`--force` 等の安全チェックを迂回するオプションを使わない
