/**
 * Event Helper Functions
 * 
 * Convenience functions for emitting events during CRUD operations
 */

import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { config } from '../config';
import type * as schema from '../db/schema';
import * as schemaModule from '../db/schema';
import {
    createAfterEventContext,
    createBeforeEventContext,
    createEventMetadata,
} from './context';
import { eventEmitter } from './emitter';
import type { EventMetadata, EventOperation } from './types';

/**
 * Execute a database operation with event emission
 * 
 * This function:
 * 1. Emits before events (blocking, can modify payload)
 * 2. Executes the operation within a transaction
 * 3. Emits after events (non-blocking, after commit)
 * 
 * @param entity - Entity name (e.g., 'events', 'users')
 * @param operation - Operation type ('create', 'update', 'delete')
 * @param payload - Initial payload
 * @param metadata - Event metadata
 * @param dbOperation - Function that performs the actual DB operation
 * @returns Result of the database operation
 */
export async function withEvents<TInput = unknown, TOutput = unknown>(
  entity: string,
  operation: EventOperation,
  payload: TInput,
  metadata: Omit<EventMetadata, 'entity' | 'operation' | 'timestamp'>,
  dbOperation: (
    tx: PostgresJsDatabase<typeof schema> | BunSQLiteDatabase<typeof schema>,
    modifiedPayload: TInput
  ) => Promise<TOutput>
): Promise<TOutput> {
  const { db } = await import('../db/client');
  const { sql } = await import('../db/client');

  // Create full metadata
  const fullMetadata = createEventMetadata(entity, operation, metadata);

  // Handle transactions based on database type
  // Drizzle provides a unified transaction API via db.transaction()
  if (typeof (db as any).transaction === 'function') {
    // Use Drizzle's transaction API (works for both PostgreSQL and SQLite)
    return await (db as any).transaction(async (tx: typeof db) => {
      // Emit before events and get modified payload
      const beforeContext = createBeforeEventContext(tx, payload, fullMetadata);
      const modifiedPayload = await eventEmitter.emitBefore(
        entity,
        operation,
        beforeContext
      );

      // Execute database operation
      const result = await dbOperation(tx, modifiedPayload);

      // After transaction commits, emit after events (non-blocking)
      // Use setImmediate to ensure this happens after the transaction callback completes
      // The transaction callback completes after commit, so this is safe
      setImmediate(async () => {
        try {
          const afterContext = createAfterEventContext(result, fullMetadata);
          await eventEmitter.emitAfter(entity, operation, afterContext);
        } catch (error) {
          // After events are non-blocking, so we log but don't throw
          console.error('Error in after event emission:', error);
        }
      });

      return result;
    });
  } else if (config.databaseType === 'postgres' && typeof sql.begin === 'function') {
    // Fallback for PostgreSQL: use postgres-js transaction directly
    return await sql.begin(async (txSql) => {
      // Create Drizzle transaction instance
      const { drizzle } = await import('drizzle-orm/postgres-js');
      const tx = drizzle(txSql, { schema: schemaModule });

      // Emit before events and get modified payload
      const beforeContext = createBeforeEventContext(tx, payload, fullMetadata);
      const modifiedPayload = await eventEmitter.emitBefore(
        entity,
        operation,
        beforeContext
      );

      // Execute database operation
      const result = await dbOperation(tx, modifiedPayload);

      // After transaction commits, emit after events (non-blocking)
      setImmediate(async () => {
        try {
          const afterContext = createAfterEventContext(result, fullMetadata);
          await eventEmitter.emitAfter(entity, operation, afterContext);
        } catch (error) {
          console.error('Error in after event emission:', error);
        }
      });

      return result;
    });
  } else {
    // Fallback: execute without transaction (not ideal, but works for development)
    // Emit before events
    const beforeContext = createBeforeEventContext(db, payload, fullMetadata);
    const modifiedPayload = await eventEmitter.emitBefore(
      entity,
      operation,
      beforeContext
    );

    // Execute database operation
    const result = await dbOperation(db, modifiedPayload);

    // Emit after events (non-blocking)
    setImmediate(async () => {
      try {
        const afterContext = createAfterEventContext(result, fullMetadata);
        await eventEmitter.emitAfter(entity, operation, afterContext);
      } catch (error) {
        console.error('Error in after event emission:', error);
      }
    });

    return result;
  }
}

/**
 * Simplified helper for create operations
 */
export async function emitCreate<TInput = unknown, TOutput = unknown>(
  entity: string,
  payload: TInput,
  metadata: Omit<EventMetadata, 'entity' | 'operation' | 'timestamp'>,
  dbOperation: (
    tx: PostgresJsDatabase<typeof schema> | BunSQLiteDatabase<typeof schema>,
    modifiedPayload: TInput
  ) => Promise<TOutput>
): Promise<TOutput> {
  return withEvents(entity, 'create', payload, metadata, dbOperation);
}

/**
 * Simplified helper for update operations
 */
export async function emitUpdate<TInput = unknown, TOutput = unknown>(
  entity: string,
  payload: TInput,
  metadata: Omit<EventMetadata, 'entity' | 'operation' | 'timestamp'>,
  dbOperation: (
    tx: PostgresJsDatabase<typeof schema> | BunSQLiteDatabase<typeof schema>,
    modifiedPayload: TInput
  ) => Promise<TOutput>
): Promise<TOutput> {
  return withEvents(entity, 'update', payload, metadata, dbOperation);
}

/**
 * Simplified helper for delete operations
 */
export async function emitDelete<TInput = unknown, TOutput = unknown>(
  entity: string,
  payload: TInput,
  metadata: Omit<EventMetadata, 'entity' | 'operation' | 'timestamp'>,
  dbOperation: (
    tx: PostgresJsDatabase<typeof schema> | BunSQLiteDatabase<typeof schema>,
    modifiedPayload: TInput
  ) => Promise<TOutput>
): Promise<TOutput> {
  return withEvents(entity, 'delete', payload, metadata, dbOperation);
}
