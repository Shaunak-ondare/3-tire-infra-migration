variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "rds_password" {
  type      = string
  sensitive = true
  default   = null
}
