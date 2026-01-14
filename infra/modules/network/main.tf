# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "${var.environment}-bcc-events-vpc"
  auto_create_subnetworks = false
  project                 = var.project_id
}

# Subnet for Cloud Run and Cloud SQL
resource "google_compute_subnetwork" "subnet" {
  name          = "${var.environment}-bcc-events-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
  project       = var.project_id

  private_ip_google_access = true
}

# Firewall rule for internal communication
resource "google_compute_firewall" "internal" {
  name    = "${var.environment}-bcc-events-internal"
  network = google_compute_network.vpc.name
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = ["10.0.0.0/16"]
  target_tags   = ["internal"]
}

# Firewall rule for Cloud SQL
resource "google_compute_firewall" "cloud_sql" {
  name    = "${var.environment}-bcc-events-cloud-sql"
  network = google_compute_network.vpc.name
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["5432"]
  }

  source_ranges = ["10.0.0.0/16"]
  target_tags   = ["cloud-sql"]
}
