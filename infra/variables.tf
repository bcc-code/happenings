variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# Database Variables
variable "database_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "bcc_events"
}

variable "database_user" {
  description = "PostgreSQL database user"
  type        = string
  default     = "bcc_events_user"
}

variable "database_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro" # db-f1-micro, db-g1-small, db-n1-standard-1, etc.
}

# API Cloud Run Variables
variable "api_min_instances" {
  description = "Minimum number of API instances"
  type        = number
  default     = 0
}

variable "api_max_instances" {
  description = "Maximum number of API instances"
  type        = number
  default     = 10
}

variable "api_cpu" {
  description = "CPU allocation for API service"
  type        = string
  default     = "1"
}

variable "api_memory" {
  description = "Memory allocation for API service"
  type        = string
  default     = "512Mi"
}

# Admin Dashboard Cloud Run Variables
variable "admin_min_instances" {
  description = "Minimum number of Admin Dashboard instances"
  type        = number
  default     = 0
}

variable "admin_max_instances" {
  description = "Maximum number of Admin Dashboard instances"
  type        = number
  default     = 10
}

variable "admin_cpu" {
  description = "CPU allocation for Admin Dashboard service"
  type        = string
  default     = "1"
}

variable "admin_memory" {
  description = "Memory allocation for Admin Dashboard service"
  type        = string
  default     = "512Mi"
}

# End User App Cloud Run Variables
variable "app_min_instances" {
  description = "Minimum number of End User App instances"
  type        = number
  default     = 0
}

variable "app_max_instances" {
  description = "Maximum number of End User App instances"
  type        = number
  default     = 100
}

variable "app_cpu" {
  description = "CPU allocation for End User App service"
  type        = string
  default     = "1"
}

variable "app_memory" {
  description = "Memory allocation for End User App service"
  type        = string
  default     = "512Mi"
}

# Networking Variables
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "enable_private_ip" {
  description = "Enable private IP for Cloud SQL"
  type        = bool
  default     = true
}
