terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  # Optional: Use remote state backend
  # backend "gcs" {
  #   bucket = "bcc-events-terraform-state"
  #   prefix = "terraform/state"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudresourcemanager.googleapis.com",
    "compute.googleapis.com",
    "sqladmin.googleapis.com",
    "run.googleapis.com",
    "storage-api.googleapis.com",
    "secretmanager.googleapis.com",
    "redis.googleapis.com",
    "servicenetworking.googleapis.com",
    "vpcaccess.googleapis.com",
    "cloudbuild.googleapis.com",
    "containerregistry.googleapis.com",
  ])

  service = each.value
  project = var.project_id

  disable_on_destroy = false
}

# Network Module
module "network" {
  source = "./modules/network"

  project_id = var.project_id
  region     = var.region
  environment = var.environment
}

# Database Module
module "database" {
  source = "./modules/database"

  project_id     = var.project_id
  region         = var.region
  environment    = var.environment
  database_name  = var.database_name
  database_user  = var.database_user
  database_tier  = var.database_tier
  vpc_network    = module.network.vpc_network_name
  depends_on     = [module.network]
}

# Redis Module
module "redis" {
  source = "./modules/redis"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  vpc_network = module.network.vpc_network_name
  depends_on  = [module.network]
}

# Storage Module
module "storage" {
  source = "./modules/storage"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
}

# Secrets Module
module "secrets" {
  source = "./modules/secrets"

  project_id  = var.project_id
  environment = var.environment
}

# VPC Connector for Cloud Run
resource "google_vpc_access_connector" "connector" {
  name          = "${var.environment}-vpc-connector"
  region        = var.region
  network       = module.network.vpc_network_name
  ip_cidr_range = "10.8.0.0/28"

  depends_on = [module.network]
}

# API Cloud Run Service
module "api" {
  source = "./modules/api"

  project_id       = var.project_id
  region           = var.region
  environment      = var.environment
  vpc_connector    = google_vpc_access_connector.connector.name
  database_url     = module.database.connection_name
  redis_host       = module.redis.host
  storage_bucket    = module.storage.resources_bucket_name
  secrets          = module.secrets.secret_ids

  min_instances = var.api_min_instances
  max_instances = var.api_max_instances
  cpu           = var.api_cpu
  memory        = var.api_memory

  depends_on = [
    module.database,
    module.redis,
    module.storage,
    module.secrets,
    google_vpc_access_connector.connector,
  ]
}

# Admin Dashboard Cloud Run Service
module "admin" {
  source = "./modules/admin"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  api_url     = module.api.service_url

  min_instances = var.admin_min_instances
  max_instances = var.admin_max_instances
  cpu           = var.admin_cpu
  memory        = var.admin_memory

  depends_on = [module.api]
}

# End User App Cloud Run Service
module "app" {
  source = "./modules/app"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  api_url     = module.api.service_url

  min_instances = var.app_min_instances
  max_instances = var.app_max_instances
  cpu           = var.app_cpu
  memory        = var.app_memory

  depends_on = [module.api]
}
