# Memorystore Redis Instance
resource "google_redis_instance" "redis" {
  name               = "${var.environment}-bcc-events-redis"
  tier               = var.redis_tier
  memory_size_gb     = var.redis_memory_size
  region             = var.region
  project            = var.project_id
  redis_version      = "REDIS_7_0"
  display_name       = "BCC Events Redis - ${var.environment}"

  authorized_network = "projects/${var.project_id}/global/networks/${var.vpc_network}"

  redis_configs = {
    maxmemory-policy = "allkeys-lru"
  }

  depends_on = [var.vpc_network]
}
