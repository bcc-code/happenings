/**
 * Cache Table Schema
 * Stores cached data objects with TTL support
 */

import {
  pgTable,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const cache = pgTable(
  'Cache',
  {
    key: varchar('key', { length: 512 }).primaryKey(),
    value: jsonb('value').notNull(),
    expiresAt: timestamp('expiresAt'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => ({
    expiresAtIdx: index('cache_expiresat_idx').on(table.expiresAt),
    createdAtIdx: index('cache_createdat_idx').on(table.createdAt),
  })
);
