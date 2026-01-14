# Service Account for API
resource "google_service_account" "api" {
  account_id   = "${var.environment}-api-sa"
  display_name = "API Service Account - ${var.environment}"
  project      = var.project_id
}

# Grant permissions to access secrets
resource "google_project_iam_member" "api_secrets" {
  for_each = toset([
    "secretmanager.secretAccessor",
  ])

  project = var.project_id
  role    = "roles/${each.value}"
  member  = "serviceAccount:${google_service_account.api.email}"
}

# Grant permissions to access Cloud SQL
resource "google_project_iam_member" "api_sql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.api.email}"
}

# Grant permissions to access Storage
resource "google_project_iam_member" "api_storage" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.api.email}"
}

# Cloud Run Service for API
resource "google_cloud_run_service" "api" {
  name     = "${var.environment}-api"
  location = var.region
  project  = var.project_id

  template {
    spec {
      service_account_name = google_service_account.api.email
      containers {
        image = "gcr.io/${var.project_id}/${var.environment}-api:latest"

        resources {
          limits = {
            cpu    = var.cpu
            memory = var.memory
          }
        }

        env {
          name  = "NODE_ENV"
          value = "production"
        }

        env {
          name  = "PORT"
          value = "3000"
        }

        env {
          name = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = "${var.environment}-db-password"
              key  = "latest"
            }
          }
        }

        env {
          name  = "DATABASE_CONNECTION_NAME"
          value = var.database_url
        }

        env {
          name  = "STORAGE_BUCKET"
          value = var.storage_bucket
        }

        env {
          name = "AUTH0_DOMAIN"
          value_from {
            secret_key_ref {
              name = var.secrets.auth0_domain
              key  = "latest"
            }
          }
        }

        env {
          name = "AUTH0_AUDIENCE"
          value_from {
            secret_key_ref {
              name = var.secrets.auth0_audience
              key  = "latest"
            }
          }
        }

        env {
          name = "AUTH0_CLIENT_ID"
          value_from {
            secret_key_ref {
              name = var.secrets.auth0_client_id
              key  = "latest"
            }
          }
        }

        env {
          name = "AUTH0_CLIENT_SECRET"
          value_from {
            secret_key_ref {
              name = var.secrets.auth0_client_secret
              key  = "latest"
            }
          }
        }

        env {
          name = "JWT_SECRET"
          value_from {
            secret_key_ref {
              name = var.secrets.jwt_secret
              key  = "latest"
            }
          }
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = tostring(var.min_instances)
        "autoscaling.knative.dev/maxScale" = tostring(var.max_instances)
        "run.googleapis.com/vpc-access-connector" = var.vpc_connector
        "run.googleapis.com/vpc-access-egress"    = "private-ranges-only"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Allow unauthenticated access (or configure IAM as needed)
resource "google_cloud_run_service_iam_member" "api_public" {
  service  = google_cloud_run_service.api.name
  location = google_cloud_run_service.api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
  project  = var.project_id
}
