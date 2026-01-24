locals {
  project     = "study-web-app"
  environment = terraform.workspace
  region      = "ap-northeast-1"

  common_tags = {
    Project     = local.project
    Environment = local.environment
    ManagedBy   = "terraform"
  }

  # 環境ごとの設定
  env_config = {
    dev = {
      # ECS
      ecs_task_cpu      = 256
      ecs_task_memory   = 512
      ecs_desired_count = 1
      # RDS
      rds_instance_class          = "db.t3.micro"
      rds_backup_retention_period = 1
      rds_deletion_protection     = false
    }
    # stg = {
    #   # ECS
    #   ecs_task_cpu      = 256
    #   ecs_task_memory   = 512
    #   ecs_desired_count = 1
    #   # RDS
    #   rds_instance_class          = "db.t3.micro"
    #   rds_backup_retention_period = 3
    #   rds_deletion_protection     = false
    # }
    # prod = {
    #   # ECS
    #   ecs_task_cpu      = 512
    #   ecs_task_memory   = 1024
    #   ecs_desired_count = 2
    #   # RDS
    #   rds_instance_class          = "db.t3.small"
    #   rds_backup_retention_period = 7
    #   rds_deletion_protection     = true
    # }
  }

  config = local.env_config[local.environment]
}
