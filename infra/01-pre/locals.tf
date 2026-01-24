locals {
  project     = "study-web-app"
  environment = terraform.workspace
  region      = "ap-northeast-1"

  common_tags = {
    Project     = local.project
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}
