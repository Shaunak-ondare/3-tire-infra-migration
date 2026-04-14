resource "aws_vpc" "vpc_1" {
  cidr_block           = "10.20.0.0/20"
  enable_dns_hostnames = true
  enable_dns_support   = true
  instance_tenancy     = "default"

  tags = {
    Name = "shaunak-vpc"
  }
}

resource "aws_security_group" "server_sg" {
  name        = "sec-for-3-tire-app"
  description = "something"
  vpc_id      = aws_vpc.vpc_1.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "db-sec-group"
  description = "Created by RDS management console"
  vpc_id      = aws_vpc.vpc_1.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.server_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "app_server" {
  ami                         = "ami-05d2d839d4f73aafb"
  instance_type               = "c7i-flex.large"
  subnet_id                   = "subnet-0be208eee602c316b"
  key_name                    = "Mumbai1"
  associate_public_ip_address = true
  source_dest_check           = true
  monitoring                  = false
  ebs_optimized               = true
  disable_api_stop            = false
  disable_api_termination     = false
  instance_initiated_shutdown_behavior = "stop"
  vpc_security_group_ids      = [aws_security_group.server_sg.id]

  metadata_options {
    http_endpoint               = "enabled"
    http_protocol_ipv6          = "disabled"
    http_put_response_hop_limit = 2
    http_tokens                 = "required"
    instance_metadata_tags      = "disabled"
  }

  root_block_device {
    volume_size           = 10
    volume_type           = "gp3"
    iops                  = 3000
    throughput            = 125
    delete_on_termination = true
    encrypted             = false
  }

  tags = {
    Name = "machine-for-3-tire"
  }
}

resource "aws_db_instance" "app_db" {
  identifier                            = "three-tier-postgres"
  allocated_storage                     = 20
  engine                                = "postgres"
  engine_version                        = "17.6"
  instance_class                        = "db.t4g.micro"
  username                              = "app_user"
  password                              = var.rds_password
  port                                  = 5432
  db_subnet_group_name                  = "default-vpc-0ea45dc87e796e8ee"
  vpc_security_group_ids                = [aws_security_group.rds_sg.id]
  publicly_accessible                   = false
  skip_final_snapshot                   = true
  auto_minor_version_upgrade            = true
  backup_retention_period               = 1
  backup_window                         = "23:19-23:49"
  copy_tags_to_snapshot                 = true
  delete_automated_backups              = true
  deletion_protection                   = false
  iam_database_authentication_enabled   = false
  max_allocated_storage                 = 1000
  monitoring_interval                   = 0
  multi_az                              = false
  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  storage_encrypted                     = true
  storage_type                          = "gp2"
}
