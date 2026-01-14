output "resources_bucket_name" {
  description = "Resources bucket name"
  value       = google_storage_bucket.resources.name
}

output "uploads_bucket_name" {
  description = "Uploads bucket name"
  value       = google_storage_bucket.uploads.name
}

output "service_account_email" {
  description = "Storage service account email"
  value       = google_service_account.storage.email
}
