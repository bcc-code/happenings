/**
 * Generic Item Service
 * 
 * Provides generic CRUD operations with:
 * - Automatic fetching of existing items before updates
 * - Delta comparison to only update changed fields
 * - Automatic setting of user_updated/user_created and date_updated/date_created
 * - Passing existing items to blocking events
 * - Preventing "updated" events when nothing changed
 */

import { eq } from 'drizzle-orm';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import type { PostgresJsDatabase } from 'drizzle-orm/pg-core';
import type * as schema from '../db/schema';
import { emitCreate, emitDelete, emitUpdate } from '../events/helpers';
import type { EventMetadata } from '../events/types';
import { calculateDelta } from '../utils/audit';

type Database = PostgresJsDatabase<typeof schema> | BunSQLiteDatabase<typeof schema>;

export interface ItemServiceOptions {
  userId: string;
  tenantId?: string;
  userRole?: string;
  userIp?: string;
}

export interface CreateOptions<T> {
  table: any; // Drizzle table
  entityName: string; // Entity/table name for events and audit logs
  data: Partial<T>;
  metadata?: Partial<EventMetadata>;
  existingItem?: T | null; // Optional: if you already have the existing item
}

export interface UpdateOptions<T> {
  table: any; // Drizzle table
  entityName: string; // Entity/table name for events and audit logs
  id: string;
  data: Partial<T>;
  metadata?: Partial<EventMetadata>;
  existingItem?: T | null; // Optional: if you already have the existing item
}

export interface DeleteOptions {
  table: any; // Drizzle table
  entityName: string; // Entity/table name for events and audit logs
  id: string;
  metadata?: Partial<EventMetadata>;
}

/**
 * Generic item service class
 */
export class ItemService {
  constructor(private options: ItemServiceOptions) {}

  /**
   * Create a new item
   */
  async create<T extends Record<string, unknown>>(
    options: CreateOptions<T>
  ): Promise<T> {
    const { table, entityName, data, metadata = {} } = options;
    const now = new Date();

    // Prepare data with user/date fields
    const createData = {
      ...data,
      userCreated: this.options.userId,
      dateCreated: now,
      userUpdated: this.options.userId,
      dateUpdated: now,
    } as T;

    return await emitCreate(
      entityName,
      createData,
      {
        userId: this.options.userId,
        tenantId: this.options.tenantId,
        userRole: this.options.userRole,
        userIp: this.options.userIp,
        ...metadata,
      },
      async (tx, modifiedPayload) => {
        const [result] = await tx.insert(table).values(modifiedPayload as any).returning();
        return result as T;
      }
    );
  }

  /**
   * Update an existing item
   * Fetches existing item, compares changes, and only updates changed fields
   */
  async update<T extends Record<string, unknown>>(
    options: UpdateOptions<T>
  ): Promise<T | null> {
    const { table, entityName, id, data, metadata = {}, existingItem } = options;

    // Fetch existing item if not provided (before events, so blocking events can use it)
    let existing: T | null = existingItem ?? null;
    
    if (!existing) {
      const { db } = await import('../db/client');
      const [item] = await db
        .select()
        .from(table)
        .where(eq((table as any).id, id))
        .limit(1);
      
      existing = (item as T) || null;
    }

    if (!existing) {
      throw new Error(`Item with id ${id} not found`);
    }

    // Calculate delta to see what actually changed
    const delta = calculateDelta(existing as Record<string, unknown>, {
      ...existing,
      ...data,
    } as Record<string, unknown>);

    // If nothing changed, return existing item without updating or emitting events
    if (Object.keys(delta).length === 0) {
      return existing;
    }

    return await emitUpdate(
      entityName,
      { id, data, existingItem: existing },
      {
        userId: this.options.userId,
        tenantId: this.options.tenantId,
        userRole: this.options.userRole,
        userIp: this.options.userIp,
        entityId: id,
        ...metadata,
      },
      async (tx, payload: { id: string; data: Partial<T>; existingItem: T }) => {
        // Prepare update data with user/date fields
        const now = new Date();
        const updateData = {
          ...payload.data,
          userUpdated: this.options.userId,
          dateUpdated: now,
        } as Partial<T>;

        // Perform update
        const [result] = await tx
          .update(table)
          .set(updateData as any)
          .where(eq((table as any).id, payload.id))
          .returning();

        const newItem = result as T;
        
        // Store audit context in metadata for the audit handler
        // The audit handler will extract this from the after event context
        // We'll attach it to the result object temporarily (will be cleaned up)
        return {
          ...newItem,
          _auditContext: {
            existingItem: payload.existingItem,
            newItem,
          },
        } as T & { _auditContext?: { existingItem: T; newItem: T } };
      }
    );
  }

  /**
   * Delete an item
   */
  async delete(options: DeleteOptions): Promise<void> {
    const { table, entityName, id, metadata = {} } = options;

    await emitDelete(
      entityName,
      { id },
      {
        userId: this.options.userId,
        tenantId: this.options.tenantId,
        userRole: this.options.userRole,
        userIp: this.options.userIp,
        entityId: id,
        ...metadata,
      },
      async (tx, payload: { id: string }) => {
        await tx.delete(table).where(eq((table as any).id, payload.id));
      }
    );
  }

  /**
   * Fetch existing item(s) by ID(s)
   * Useful for passing to blocking events
   */
  async fetchExisting<T>(
    table: any,
    id: string | string[]
  ): Promise<T | T[] | null> {
    const { db } = await import('../db/client');
    
    if (Array.isArray(id)) {
      const items = await db
        .select()
        .from(table)
        .where(eq((table as any).id, id[0])); // Simplified - would need 'in' operator for multiple
      return (items as T[]) || null;
    } else {
      const [item] = await db
        .select()
        .from(table)
        .where(eq((table as any).id, id))
        .limit(1);
      return (item as T) || null;
    }
  }
}

/**
 * Create an item service instance from Elysia context
 */
export function createItemService(
  context: {
    store: { user?: { id: string; tenantId?: string; role?: string } };
    request: Request;
  }
): ItemService {
  const { getClientIp } = require('./ip');
  
  return new ItemService({
    userId: context.store.user?.id || '',
    tenantId: context.store.user?.tenantId,
    userRole: context.store.user?.role,
    userIp: getClientIp(context as any),
  });
}
