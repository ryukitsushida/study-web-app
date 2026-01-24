output "s3_bucket_name" {
  description = "S3 bucket name for Terraform state"
  value       = aws_s3_bucket.tfstate.id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN for Terraform state"
  value       = aws_s3_bucket.tfstate.arn
}

output "backend_config" {
  description = "Backend configuration to use in other modules"
  value       = <<-EOT
    bucket       = "${aws_s3_bucket.tfstate.id}"
    region       = "${local.region}"
    use_lockfile = true
    encrypt      = true
  EOT
}
