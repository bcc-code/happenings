-- Rollback Migration: Remove Cache Table
-- Description: Drops the cache table and its indexes

DROP INDEX IF EXISTS "cache_createdat_idx";
DROP INDEX IF EXISTS "cache_expiresat_idx";
DROP TABLE IF EXISTS "Cache";
