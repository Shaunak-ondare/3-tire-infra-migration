resource "aws_vpc" "vpc_1" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "shaunak-vpc"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

import {
  to = aws_vpc.vpc_1
  id = var.vpc_id
}

resource "aws_instance" "app_server" {
  ami                    = var.ec2_ami_id
  instance_type          = var.ec2_instance_type
  subnet_id              = var.ec2_subnet_id
  vpc_security_group_ids = [var.ec2_security_group_id]
  key_name               = var.ec2_key_name

  tags = {
    Name = "machine-for-3-tire"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

import {
  to = aws_instance.app_server
  id = var.ec2_instance_id
}

resource "aws_db_instance" "app_db" {
  identifier          = var.rds_identifier
  engine              = var.rds_engine
  instance_class      = var.rds_instance_class
  allocated_storage   = var.rds_allocated_storage
  username            = var.rds_username
  password            = var.rds_password
  port                = var.rds_port
  publicly_accessible = var.rds_publicly_accessible
  skip_final_snapshot = var.rds_skip_final_snapshot

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

import {
  to = aws_db_instance.app_db
  id = var.rds_identifier
}

resource "aws_security_group" "server_sg" {
  name        = var.server_security_group_name
  description = var.server_security_group_description
  vpc_id      = var.vpc_id

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

import {
  to = aws_security_group.server_sg
  id = var.ec2_security_group_id
}

resource "aws_security_group" "rds_sg" {
  name        = var.rds_security_group_name
  description = var.rds_security_group_description
  vpc_id      = var.vpc_id

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

import {
  to = aws_security_group.rds_sg
  id = var.rds_security_group_id
}
