variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.20.0.0/20"

}

variable "vpc_id" {
  description = "VPC ID for the security group"
  type        = string
  default     = "vpc-0ea45dc87e796e8ee"

}

variable "ec2_instance_id" {
  description = "Existing EC2 instance ID"
  type        = string
  default     = "i-07c6d0232a8d3d645"
}

variable "ec2_ami_id" {
  description = "AMI ID for the EC2 instance"
  type        = string
  default     = "ami-05d2d839d4f73aafb"
}


variable "ec2_instance_type" {
  description = "Instance type for the EC2 instance"
  type        = string
  default     = "c7i-flex.large"
}
variable "ec2_subnet_id" {
  description = "Subnet ID for the EC2 instance"
  type        = string
  default     = "subnet-0be208eee602c316b"
}
variable "ec2_security_group_id" {
  description = "Security group ID for the EC2 instance"
  type        = string
  default     = "sg-019828b910cc99f69"
}
variable "ec2_key_name" {
  description = "Key pair name for the EC2 instance"
  type        = string
  default     = "Mumbai1"
}


# rds variables


variable "rds_identifier" {
  description = "Identifier for the RDS instance"
  type        = string
  default     = "three-tier-postgres"
}
variable "rds_engine" {
  description = "Database engine for the existing RDS instance"
  type        = string
  default     = "postgres"
}
variable "rds_instance_class" {
  description = "Instance class for the RDS instance"
  type        = string
  default     = "db.t4g.micro"
}
variable "rds_allocated_storage" {
  description = "Allocated storage for the RDS instance"
  type        = number
  default     = 20
}
variable "rds_db_name" {
  description = "Name of the database for the RDS instance"
  type        = string
  default     = "three_tier_app"
}
variable "rds_username" {
  description = "Username for the RDS instance"
  type        = string
  default     = "app_user"
}
variable "rds_password" {
  description = "Password for the RDS instance"
  type        = string
  sensitive   = true
  default     = "Test1234"
}
variable "rds_port" {
  description = "Port for the RDS instance"
  type        = number
  default     = 5432
}
variable "rds_publicly_accessible" {
  description = "Whether the RDS instance is publicly accessible"
  type        = bool
  default     = false
}
variable "rds_skip_final_snapshot" {
  description = "Whether to skip final snapshot on destroy"
  type        = bool
  default     = true
}

variable "rds_security_group_id" {
  description = "Security group ID for the RDS instance"
  type        = string
  default     = "sg-000bd238fd2667fce"
}

variable "server_security_group_name" {
  description = "Name of the security group for the app server"
  type        = string
  default     = "sec-for-3-tire-app"
}
variable "server_security_group_description" {
  description = "Description of the app server security group"
  type        = string
  default     = "something"
}
variable "rds_security_group_name" {
  description = "Name of the security group for the RDS instance"
  type        = string
  default     = "db-sec-group"
}
variable "rds_security_group_description" {
  description = "Description of the RDS security group"
  type        = string
  default     = "Created by RDS management console"
}
