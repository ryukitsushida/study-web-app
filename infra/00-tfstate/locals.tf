data "aws_caller_identity" "current" {}

locals {
  project = "study-web-app"
  region  = "ap-northeast-1"

  common_tags = {
    Project   = local.project
    ManagedBy = "terraform"
  }
}
