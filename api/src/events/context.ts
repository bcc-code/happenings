/**
 * Event Context Builder
 * 
 * Creates event contexts with proper database connections for transactions
 */

import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { db } from '../db/client';
import type * as schema from '../db/schema';
import type {
    AfterEventContext,
    BeforeEventContext,
    EventMetadata,
    EventOperation,
} from './types';

/**
 * Create a before event context
 */
export function createBeforeEventContext<T = unknown>(
  tx: PostgresJsDatabase<typeof schema> | BunSQLiteDatabase<typeof schema>,
  payload: T,
  metadata: EventMetadata
): BeforeEventContext<T> {
  return {
    tx,
    db, // Non-transactional connection
    payload,
    metadata,
  };
}

/**
 * Create an after event context
 */
export function createAfterEventContext<T = unknown>(
  payload: T,
  metadata: EventMetadata
): AfterEventContext<T> {
  return {
    db, // Regular connection (transaction already committed)
    payload,
    metadata,
  };
}

/**
 * Create event metadata
 */
export function createEventMetadata(
  entity: string,
  operation: EventOperation,
  options?: {
    entityId?: string;
    userId?: string;
    tenantId?: string;
    [key: string]: unknown;
  }
): EventMetadata {
  return {
    entity,
    operation,
    entityId: options?.entityId,
    userId: options?.userId,
    tenantId: options?.tenantId,
    timestamp: new Date(),
    ...options,
  };
}
