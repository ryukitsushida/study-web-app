# =============================================================================
# Route53 DNS Records
# =============================================================================

# ALB への A レコード（エイリアス）
resource "aws_route53_record" "api" {
  count = local.enable_https ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# IPv6 対応（オプション）
resource "aws_route53_record" "api_ipv6" {
  count = local.enable_https ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}
