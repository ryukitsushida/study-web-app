---
applyTo: "infra/**"
---

# Infrastructure 指示

## ① 技術スタック

| カテゴリ   | 技術                         | バージョン |
| ---------- | ---------------------------- | ---------- |
| IaC        | Terraform                    | ≥ 1.10     |
| Provider   | AWS Provider                 | ~> 5.0     |
| State 管理 | S3 Backend (native lockfile) | -          |
| リージョン | ap-northeast-1               | -          |
| コンテナ   | ECS Fargate                  | -          |
| DB         | RDS PostgreSQL               | -          |
| LB         | ALB                          | -          |
| DNS/TLS    | Route53 + ACM                | -          |

## ② ディレクトリ構成

```
infra/
├── 00-tfstate/    # S3 ステートバケットのブートストラップ (単独)
├── 01-pre/        # ECR リポジトリ等の事前準備リソース
└── 02-main/       # メインインフラ (VPC, ECS, RDS, ALB, ACM, Route53)
```

- **インクリメンタルブートストラップ**: 00 → 01 → 02 の順に適用する
- **環境管理**: Terraform Workspaces (`dev` / `stg` / `prod`) で環境を分離する
- **ステート分離**: モジュールごとに個別の state ファイルキーを使用する
- **ファイル命名**: リソース種別ごとに分割 (`vpc.tf`, `ecs.tf`, `rds.tf`, `alb.tf` 等)

## ③ アーキテクチャ・設計指針

- **ネットワーク構成**:
  - Public Subnet (2 AZ): ALB のみ
  - Private Subnet (2 AZ): ECS タスク + RDS
  - ECS タスクのアウトバウンドが必要な場合は、NAT Gateway または VPC Endpoint を利用する
  - 例外（学習用/dev）として ECS タスクを Public Subnet に置く場合は、その理由を明記し、Security Group 等で到達範囲を最小化する
  - セキュリティグループはリソース間の参照で最小権限を維持する (`ALB → ECS:8000 → RDS:5432`)
- **設定の一元管理**: `locals.tf` に環境別設定 (`terraform.workspace` ベース) を集約する。ハードコードを避ける
- **変数設計**: 機密情報 (`db_password`) は `sensitive = true`。オプション機能 (`enable_vpc_flow_logs` 等) はフラグで制御する
- **リソース命名規則**: `${project}-${resource-type}[-${index}][-${description}]`
- **ライフサイクル管理**:
  - `create_before_destroy = true`: セキュリティグループ等のゼロダウンタイム更新
  - `prevent_destroy = true`: S3 ステートバケット等の保護
  - `ignore_changes`: ECS desired_count (手動スケーリング許容)
- **セキュリティ強化**:
  - ECS: read-only root filesystem、非 root ユーザー (1000:1000)
  - RDS: プライベートサブネット配置、暗号化有効
  - ALB: TLS 1.2+ ポリシー (`ELBSecurityPolicy-TLS13-1-2-2021-06`)
  - S3: パブリックアクセスブロック、HTTPS 強制
- **デフォルトタグ**: `Project`, `Environment`, `ManagedBy` をプロバイダレベルで全リソースに付与する

## ④ テスト方針

- **静的解析**: `terraform validate` と `terraform fmt -check` を CI で実行する
- **Plan レビュー**: PR 時に `terraform plan` の差分を確認する。破壊的変更がないことを目視で検証する
- **セキュリティスキャン**: tfsec / checkov でセキュリティポリシー違反を検出する
- **環境別テスト**: dev 環境で先行適用し、問題がなければ stg → prod へ順次展開する
- **State 整合性**: `terraform plan` で差分が 0 であることを定期的に確認する (ドリフト検出)
