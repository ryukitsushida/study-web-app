# =============================================================================
# ACM Certificate（HTTPS用）
# =============================================================================

locals {
  enable_https = var.domain_name != ""
}

# ACM 証明書
resource "aws_acm_certificate" "main" {
  count = local.enable_https ? 1 : 0

  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${local.project}-cert"
  }
}

# DNS検証用レコード
resource "aws_route53_record" "cert_validation" {
  for_each = local.enable_https ? {
    for dvo in aws_acm_certificate.main[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  zone_id = var.hosted_zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

# 証明書の検証完了を待機
resource "aws_acm_certificate_validation" "main" {
  count = local.enable_https ? 1 : 0

  certificate_arn         = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
