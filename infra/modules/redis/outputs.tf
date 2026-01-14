output "host" {
  description = "Redis host"
  value       = google_redis_instance.redis.host
}

output "port" {
  description = "Redis port"
  value       = google_redis_instance.redis.port
}

output "current_location_id" {
  description = "Current location ID"
  value       = google_redis_instance.redis.current_location_id
}
