/**
 * Event System Types
 * 
 * Defines types for the event-driven architecture supporting:
 * - Before events (blocking, can modify payload, have transaction context)
 * - After events (non-blocking, after transaction commits)
 */

import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import type * as schema from '../db/schema';

/**
 * Event operation types
 */
export type EventOperation = 'create' | 'update' | 'delete';

/**
 * Event context for before events
 * Provides both transactional and non-transactional database access
 */
export interface BeforeEventContext<T = unknown> {
  /**
   * Database connection within the transaction
   * All operations here will be part of the atomic transaction
   */
  tx: PostgresJsDatabase<typeof schema> | BunSQLiteDatabase<typeof schema>;
  
  /**
   * Non-transactional database connection
   * Use for read operations that shouldn't block the transaction
   * or for operations that need to see committed data
   */
  db: PostgresJsDatabase<typeof schema> | BunSQLiteDatabase<typeof schema>;
  
  /**
   * The payload being operated on
   * Can be modified by event handlers
   */
  payload: T;
  
  /**
   * Additional metadata about the operation
   */
  metadata: EventMetadata;
}

/**
 * Event context for after events
 * Fired after transaction commits successfully
 */
export interface AfterEventContext<T = unknown> {
  /**
   * Regular database connection (transaction already committed)
   */
  db: PostgresJsDatabase<typeof schema> | BunSQLiteDatabase<typeof schema>;
  
  /**
   * The final payload that was committed
   */
  payload: T;
  
  /**
   * Additional metadata about the operation
   */
  metadata: EventMetadata;
}

/**
 * Metadata about the event
 */
export interface EventMetadata {
  /**
   * The entity/table name (e.g., 'events', 'users', 'registrations')
   */
  entity: string;
  
  /**
   * The operation being performed
   */
  operation: EventOperation;
  
  /**
   * The ID of the entity (if available)
   */
  entityId?: string;
  
  /**
   * User ID who triggered the operation (from auth context)
   */
  userId?: string;
  
  /**
   * Tenant ID (if applicable)
   */
  tenantId?: string;
  
  /**
   * User IP address
   */
  userIp?: string;
  
  /**
   * User role at time of operation
   */
  userRole?: string;
  
  /**
   * Timestamp when the event was triggered
   */
  timestamp: Date;
  
  /**
   * Additional custom metadata
   */
  [key: string]: unknown;
}

/**
 * Before event handler
 * Can modify the payload and perform operations within the transaction
 * 
 * @returns Modified payload (or original if no changes)
 */
export type BeforeEventHandler<T = unknown> = (
  context: BeforeEventContext<T>
) => Promise<T> | T;

/**
 * After event handler
 * Non-blocking, runs after transaction commits
 * 
 * @returns Promise that resolves when handler completes
 */
export type AfterEventHandler<T = unknown> = (
  context: AfterEventContext<T>
) => Promise<void> | void;

/**
 * Event handler registration
 */
export interface EventHandlerRegistration {
  /**
   * Unique identifier for the handler
   */
  id: string;
  
  /**
   * Entity name to listen to (e.g., 'events', 'users')
   * Use '*' to listen to all entities
   */
  entity: string | '*';
  
  /**
   * Operations to listen to
   * Use '*' to listen to all operations
   */
  operations: EventOperation[] | '*';
  
  /**
   * Handler function
   */
  handler: BeforeEventHandler | AfterEventHandler;
  
  /**
   * Whether this is a before or after event handler
   */
  type: 'before' | 'after';
  
  /**
   * Optional priority (higher runs first)
   * Default: 0
   */
  priority?: number;
}
