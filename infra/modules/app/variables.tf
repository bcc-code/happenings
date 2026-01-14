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

variable "api_url" {
  description = "API service URL"
  type        = string
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
