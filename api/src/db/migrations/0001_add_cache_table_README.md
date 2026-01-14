# Cache Table Migration

## Overview

This migration adds a `Cache` table for PostgreSQL-based caching with TTL (Time To Live) support.

## Migration Files

- `0001_add_cache_table.sql` - Forward migration (creates table and indexes)
- `0001_add_cache_table_rollback.sql` - Rollback migration (drops table and indexes)

## Recommended Approach

**Use Drizzle Kit to generate the proper migration structure:**

```bash
cd api
bun run db:generate
```

This will create the proper Drizzle migration structure with metadata files.

## Manual Application

If you need to apply the SQL manually:

```bash
# For PostgreSQL
psql $DATABASE_URL -f src/db/migrations/0001_add_cache_table.sql

# Or using Drizzle migrate
bun run db:migrate
```

## What This Migration Creates

1. **Cache Table** with:
   - `key` (varchar 512, primary key) - Cache key
   - `value` (jsonb) - Cached data as JSON
   - `expiresAt` (timestamp, nullable) - Expiration time for TTL
   - `createdAt` (timestamp) - Creation timestamp
   - `updatedAt` (timestamp) - Last update timestamp

2. **Indexes**:
   - `cache_expiresat_idx` - For efficient expired entry cleanup
   - `cache_createdat_idx` - For cache statistics and cleanup

## Usage

After migration, use the cache utility:

```typescript
import { getCache, setCache, deleteCache } from '../utils/cache';

// Set cache with 1 hour TTL
await setCache('user:123', { name: 'John' }, { ttl: 3600 });

// Get cache
const user = await getCache<{ name: string }>('user:123');

// Delete cache
await deleteCache('user:123');
```
