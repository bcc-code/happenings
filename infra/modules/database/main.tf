# Random password for database
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# Store password in Secret Manager
resource "google_secret_manager_secret" "db_password" {
  secret_id = "${var.environment}-db-password"

  replication {
    automatic = true
  }

  project = var.project_id
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# Private Service Connection for Cloud SQL
resource "google_compute_global_address" "private_ip_address" {
  name          = "${var.environment}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = "projects/${var.project_id}/global/networks/${var.vpc_network}"
  project       = var.project_id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = "projects/${var.project_id}/global/networks/${var.vpc_network}"
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# Cloud SQL PostgreSQL Instance
resource "google_sql_database_instance" "postgres" {
  name             = "${var.environment}-bcc-events-db"
  database_version = "POSTGRES_15"
  region           = var.region
  project          = var.project_id

  settings {
    tier                        = var.database_tier
    availability_type           = "ZONAL"
    deletion_protection_enabled = var.environment == "prod"

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = "projects/${var.project_id}/global/networks/${var.vpc_network}"
      enable_private_path_for_google_cloud_services = true
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      transaction_log_retention_days  = 7
      retained_backups               = 7
    }

    database_flags {
      name  = "max_connections"
      value = "100"
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }
  }

  depends_on = [
    google_service_networking_connection.private_vpc_connection
  ]
}

# Database
resource "google_sql_database" "database" {
  name     = var.database_name
  instance = google_sql_database_instance.postgres.name
  project  = var.project_id
}

# Database User
resource "google_sql_user" "user" {
  name     = var.database_user
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
  project  = var.project_id
}
