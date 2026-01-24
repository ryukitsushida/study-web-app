# ALB用セキュリティグループ
resource "aws_security_group" "alb" {
  name        = "${local.project}-alb-sg"
  description = "Security group for ALB - allows HTTP/HTTPS from internet"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${local.project}-alb-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id
  description       = "HTTP from internet"
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"

  tags = {
    Name = "${local.project}-alb-http-ingress"
  }
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb.id
  description       = "HTTPS from internet"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"

  tags = {
    Name = "${local.project}-alb-https-ingress"
  }
}

resource "aws_vpc_security_group_egress_rule" "alb_to_ecs" {
  security_group_id            = aws_security_group.alb.id
  description                  = "Allow traffic to ECS tasks only"
  from_port                    = var.container_port
  to_port                      = var.container_port
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.ecs_tasks.id

  tags = {
    Name = "${local.project}-alb-to-ecs-egress"
  }
}

# ECSタスク用セキュリティグループ
resource "aws_security_group" "ecs_tasks" {
  name        = "${local.project}-ecs-tasks-sg"
  description = "Security group for ECS tasks - allows traffic from ALB only"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${local.project}-ecs-tasks-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "ecs_from_alb" {
  security_group_id            = aws_security_group.ecs_tasks.id
  description                  = "Allow traffic from ALB only"
  from_port                    = var.container_port
  to_port                      = var.container_port
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.alb.id

  tags = {
    Name = "${local.project}-ecs-from-alb-ingress"
  }
}

resource "aws_vpc_security_group_egress_rule" "ecs_https" {
  security_group_id = aws_security_group.ecs_tasks.id
  description       = "Allow HTTPS outbound for ECR, CloudWatch, etc."
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"

  tags = {
    Name = "${local.project}-ecs-https-egress"
  }
}

resource "aws_vpc_security_group_egress_rule" "ecs_to_rds" {
  security_group_id            = aws_security_group.ecs_tasks.id
  description                  = "Allow PostgreSQL outbound to RDS only"
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.rds.id

  tags = {
    Name = "${local.project}-ecs-to-rds-egress"
  }
}

# =============================================================================
# RDS用セキュリティグループ
# =============================================================================

resource "aws_security_group" "rds" {
  name        = "${local.project}-rds-sg"
  description = "Security group for RDS - allows traffic from ECS only"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${local.project}-rds-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_ecs" {
  security_group_id            = aws_security_group.rds.id
  description                  = "Allow PostgreSQL from ECS tasks only"
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.ecs_tasks.id

  tags = {
    Name = "${local.project}-rds-from-ecs-ingress"
  }
}
