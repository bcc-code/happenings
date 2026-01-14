variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "database_name" {
  description = "Database name"
  type        = string
}

variable "database_user" {
  description = "Database user"
  type        = string
}

variable "database_tier" {
  description = "Database instance tier"
  type        = string
}

variable "vpc_network" {
  description = "VPC network name"
  type        = string
}
