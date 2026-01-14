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

variable "vpc_connector" {
  description = "VPC connector name"
  type        = string
}

variable "database_url" {
  description = "Cloud SQL connection name"
  type        = string
}

variable "redis_host" {
  description = "Redis host"
  type        = string
}

variable "storage_bucket" {
  description = "Storage bucket name"
  type        = string
}

variable "secrets" {
  description = "Map of secret IDs"
  type        = map(string)
}

variable "min_instances" {
  description = "Minimum instances"
  type        = number
}

variable "max_instances" {
  description = "Maximum instances"
  type        = number
}

variable "cpu" {
  description = "CPU allocation"
  type        = string
}

variable "memory" {
  description = "Memory allocation"
  type        = string
}
