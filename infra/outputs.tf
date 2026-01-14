output "api_url" {
  description = "API Cloud Run service URL"
  value       = module.api.service_url
}

output "admin_dashboard_url" {
  description = "Admin Dashboard Cloud Run service URL"
  value       = module.admin.service_url
}

output "end_user_app_url" {
  description = "End User App Cloud Run service URL"
  value       = module.app.service_url
}

output "database_connection_name" {
  description = "Cloud SQL connection name"
  value       = module.database.connection_name
  sensitive   = true
}

output "database_private_ip" {
  description = "Cloud SQL private IP address"
  value       = module.database.private_ip_address
  sensitive   = true
}

output "storage_bucket_resources" {
  description = "Resources storage bucket name"
  value       = module.storage.resources_bucket_name
}

output "storage_bucket_uploads" {
  description = "Uploads storage bucket name"
  value       = module.storage.uploads_bucket_name
}

output "vpc_network_name" {
  description = "VPC network name"
  value       = module.network.vpc_network_name
}

output "vpc_connector_name" {
  description = "VPC connector name"
  value       = google_vpc_access_connector.connector.name
}
