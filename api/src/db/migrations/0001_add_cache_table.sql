-- Migration: Add Cache Table
-- Description: Creates a cache table for PostgreSQL-based caching with TTL support

CREATE TABLE IF NOT EXISTS "Cache" (
	"key" varchar(512) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "cache_expiresat_idx" ON "Cache" ("expiresAt");
CREATE INDEX IF NOT EXISTS "cache_createdat_idx" ON "Cache" ("createdAt");
