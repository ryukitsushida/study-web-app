# =============================================================================
# RDS PostgreSQL
# =============================================================================

# DB サブネットグループ
resource "aws_db_subnet_group" "main" {
  name       = "${local.project}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${local.project}-db-subnet-group"
  }
}

# RDS インスタンス
resource "aws_db_instance" "main" {
  identifier = "${local.project}-db"

  # エンジン設定
  engine = "postgres"
  instance_class        = local.config.rds_instance_class
  allocated_storage     = 20
  max_allocated_storage = 100 # ストレージ自動スケーリング

  # データベース設定
  db_name  = "app"
  username = "appuser"
  password = var.db_password

  # ネットワーク設定
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  port                   = 5432

  # ストレージ設定
  storage_type      = "gp3"
  storage_encrypted = true

  # バックアップ設定
  backup_retention_period = local.config.rds_backup_retention_period
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  # パフォーマンス設定
  performance_insights_enabled = false # コスト削減

  # その他
  auto_minor_version_upgrade = true
  deletion_protection        = local.config.rds_deletion_protection
  skip_final_snapshot        = local.environment != "prod"
  final_snapshot_identifier  = local.environment == "prod" ? "${local.project}-db-final-snapshot" : null

  tags = {
    Name = "${local.project}-db"
  }
}
