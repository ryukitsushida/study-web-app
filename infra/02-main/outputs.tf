output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.api.name
}

output "api_endpoint" {
  description = "API endpoint URL"
  value       = local.enable_https ? "https://${var.domain_name}" : "http://${aws_lb.main.dns_name}"
}

output "api_domain" {
  description = "API domain name (if configured)"
  value       = local.enable_https ? var.domain_name : null
}

output "ecr_repository_url" {
  description = "ECR repository URL (from data source)"
  value       = data.aws_ecr_repository.api.repository_url
}

# =============================================================================
# RDS
# =============================================================================

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_db_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

# =============================================================================
# SSL/TLS
# =============================================================================

output "certificate_arn" {
  description = "ACM certificate ARN (if HTTPS enabled)"
  value       = local.enable_https ? aws_acm_certificate.main[0].arn : null
}

output "certificate_status" {
  description = "ACM certificate status (if HTTPS enabled)"
  value       = local.enable_https ? aws_acm_certificate.main[0].status : null
}
