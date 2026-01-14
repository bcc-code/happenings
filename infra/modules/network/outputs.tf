output "vpc_network_name" {
  description = "VPC network name"
  value       = google_compute_network.vpc.name
}

output "vpc_network_id" {
  description = "VPC network ID"
  value       = google_compute_network.vpc.id
}

output "subnet_name" {
  description = "Subnet name"
  value       = google_compute_subnetwork.subnet.name
}

output "subnet_cidr" {
  description = "Subnet CIDR"
  value       = google_compute_subnetwork.subnet.ip_cidr_range
}
