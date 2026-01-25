# =============================================================================
# 必須変数（環境変数 TF_VAR_xxx で設定）
# =============================================================================

variable "db_password" {
  description = "RDS database password (set via TF_VAR_db_password)"
  type        = string
  sensitive   = true
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "allowed_origins" {
  description = "CORS allowed origins, comma separated (set via TF_VAR_allowed_origins)"
  type        = string
  default     = "http://localhost:3000"
}

# =============================================================================
# ドメイン設定（HTTPS使用時に必須）
# =============================================================================

variable "domain_name" {
  description = "Domain name for the API (e.g., api.example.com). Leave empty for HTTP only."
  type        = string
  default     = ""
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID (required if domain_name is set)"
  type        = string
  default     = ""
}

# =============================================================================
# オプション変数
# =============================================================================

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}

variable "container_port" {
  description = "Container port"
  type        = number
  default     = 8000
}

variable "enable_vpc_flow_logs" {
  description = "Enable VPC flow logs"
  type        = bool
  default     = true
}

variable "enable_alb_access_logs" {
  description = "Enable ALB access logs"
  type        = bool
  default     = false
}
