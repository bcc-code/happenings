# Resources bucket (for event resources, documents, etc.)
resource "google_storage_bucket" "resources" {
  name          = "${var.project_id}-${var.environment}-resources"
  location      = var.region
  project       = var.project_id
  force_destroy = var.environment != "prod"

  uniform_bucket_level_access = true

  versioning {
    enabled = var.environment == "prod"
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Uploads bucket (for user uploads)
resource "google_storage_bucket" "uploads" {
  name          = "${var.project_id}-${var.environment}-uploads"
  location      = var.region
  project       = var.project_id
  force_destroy = var.environment != "prod"

  uniform_bucket_level_access = true

  versioning {
    enabled = var.environment == "prod"
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }
}

# Service account for Cloud Run to access storage
resource "google_service_account" "storage" {
  account_id   = "${var.environment}-storage-sa"
  display_name = "Storage Service Account - ${var.environment}"
  project      = var.project_id
}

# IAM binding for resources bucket
resource "google_storage_bucket_iam_member" "resources" {
  bucket = google_storage_bucket.resources.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.storage.email}"
}

# IAM binding for uploads bucket
resource "google_storage_bucket_iam_member" "uploads" {
  bucket = google_storage_bucket.uploads.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.storage.email}"
}
