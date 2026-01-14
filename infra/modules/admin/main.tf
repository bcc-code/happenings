# Cloud Run Service for Admin Dashboard
resource "google_cloud_run_service" "admin" {
  name     = "${var.environment}-admin"
  location = var.region
  project  = var.project_id

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/${var.environment}-admin:latest"

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
          name  = "API_URL"
          value = var.api_url
        }

        env {
          name = "AUTH0_DOMAIN"
          value_from {
            secret_key_ref {
              name = "${var.environment}-auth0-domain"
              key  = "latest"
            }
          }
        }

        env {
          name = "AUTH0_CLIENT_ID"
          value_from {
            secret_key_ref {
              name = "${var.environment}-auth0-client-id"
              key  = "latest"
            }
          }
        }

        env {
          name = "AUTH0_AUDIENCE"
          value_from {
            secret_key_ref {
              name = "${var.environment}-auth0-audience"
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
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Allow unauthenticated access (or configure IAM as needed)
resource "google_cloud_run_service_iam_member" "admin_public" {
  service  = google_cloud_run_service.admin.name
  location = google_cloud_run_service.admin.location
  role     = "roles/run.invoker"
  member   = "allUsers"
  project  = var.project_id
}
