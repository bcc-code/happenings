/**
 * Cache Utility
 * PostgreSQL-based caching with TTL support
 */

import { db } from '../db/client';
import { cache } from '../db/schema';
import { eq, lt } from 'drizzle-orm';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

/**
 * Get a cached value by key
 * @param key Cache key
 * @returns Cached value or null if not found/expired
 */
export async function getCache<T = unknown>(key: string): Promise<T | null> {
  const now = new Date();

  const result = await db.query.cache.findFirst({
    where: eq(cache.key, key),
  });

  if (!result) {
    return null;
  }

  // Check if expired
  if (result.expiresAt && result.expiresAt < now) {
    // Auto-delete expired entry
    await deleteCache(key);
    return null;
  }

  return result.value as T;
}

/**
 * Set a cached value with optional TTL
 * @param key Cache key
 * @param value Value to cache (will be JSON stringified)
 * @param options Cache options including TTL
 */
export async function setCache(
  key: string,
  value: unknown,
  options?: CacheOptions
): Promise<void> {
  const now = new Date();
  const expiresAt = options?.ttl
    ? new Date(now.getTime() + options.ttl * 1000)
    : null;

  await db
    .insert(cache)
    .values({
      key,
      value: value as Record<string, unknown>,
      expiresAt,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: cache.key,
      set: {
        value: value as Record<string, unknown>,
        expiresAt,
        updatedAt: now,
      },
    });
}

/**
 * Delete a cached value by key
 * @param key Cache key
 */
export async function deleteCache(key: string): Promise<void> {
  await db.delete(cache).where(eq(cache.key, key));
}

/**
 * Clear all expired cache entries
 * @returns Number of entries deleted
 */
export async function clearExpiredCache(): Promise<number> {
  const now = new Date();

  const result = await db
    .delete(cache)
    .where(lt(cache.expiresAt, now))
    .returning({ key: cache.key });

  return result.length;
}

/**
 * Clear all cache entries (use with caution)
 * @returns Number of entries deleted
 */
export async function clearAllCache(): Promise<number> {
  const result = await db.delete(cache).returning({ key: cache.key });
  return result.length;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  total: number;
  expired: number;
  active: number;
}> {
  const now = new Date();
  const all = await db.query.cache.findMany();

  const expired = all.filter(
    (entry) => entry.expiresAt && entry.expiresAt < now
  );

  return {
    total: all.length,
    expired: expired.length,
    active: all.length - expired.length,
  };
}
