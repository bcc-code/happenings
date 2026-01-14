/**
 * Audit Logging Service
 * 
 * Provides utilities for creating audit logs with delta tracking
 * and parent-child relationship support
 */

import { db } from '../db/client';
import { auditLogs } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import type * as schema from '../db/schema';

export type EventOperation = 'create' | 'update' | 'delete';

export interface AuditLogData {
  collection: string;
  itemId: string;
  operation: EventOperation;
  userId: string;
  userIp?: string;
  userRole?: string;
  tenantId?: string;
  delta: Record<string, { old: unknown; new: unknown }>;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  parentId?: string;
}

/**
 * Calculate delta between old and new data
 * Returns an object with only the fields that changed
 */
export function calculateDelta(
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> {
  const delta: Record<string, { old: unknown; new: unknown }> = {};

  // If oldData is null, this is a create operation - all fields are new
  if (!oldData) {
    for (const [key, value] of Object.entries(newData)) {
      // Skip internal fields that shouldn't be in delta
      if (key === 'id' || key === 'createdAt' || key === 'updatedAt') {
        continue;
      }
      delta[key] = { old: null, new: value };
    }
    return delta;
  }

  // Compare all fields in newData
  for (const [key, newValue] of Object.entries(newData)) {
    // Skip internal fields
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt') {
      continue;
    }

    const oldValue = oldData[key];

    // Deep comparison for objects/arrays
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      delta[key] = { old: oldValue, new: newValue };
    }
  }

  // Check for deleted fields (present in old but not in new)
  for (const [key, oldValue] of Object.entries(oldData)) {
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt') {
      continue;
    }

    if (!(key in newData)) {
      delta[key] = { old: oldValue, new: null };
    }
  }

  return delta;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  data: AuditLogData,
  tx?: PostgresJsDatabase<typeof schema> | BunSQLiteDatabase<typeof schema>
): Promise<string> {
  const database = tx || db;

  const [auditLog] = await database
    .insert(auditLogs)
    .values({
      collection: data.collection,
      itemId: data.itemId,
      operation: data.operation,
      userId: data.userId,
      userIp: data.userIp || null,
      userRole: data.userRole || null,
      tenantId: data.tenantId || null,
      delta: data.delta as any,
      oldData: (data.oldData as any) || null,
      newData: (data.newData as any) || null,
      parentId: data.parentId || null,
    })
    .returning({ id: auditLogs.id });

  return auditLog.id;
}

/**
 * Create multiple audit logs (for parent-child relationships)
 * 
 * @param logs - Array of audit log data. Child logs should have parentId set to 'PARENT_PLACEHOLDER'
 *               and will be linked to the parent log with matching collection
 */
export async function createAuditLogs(
  logs: AuditLogData[],
  tx?: PostgresJsDatabase<typeof schema> | BunSQLiteDatabase<typeof schema>
): Promise<string[]> {
  const database = tx || db;
  const ids: string[] = [];

  // First, create parent logs (logs without parentId or with 'PARENT_PLACEHOLDER')
  const parentLogs = logs.filter((log) => !log.parentId || log.parentId === 'PARENT_PLACEHOLDER');
  
  for (const log of parentLogs) {
    // Create parent log (remove placeholder)
    const parentLog = { ...log };
    if (parentLog.parentId === 'PARENT_PLACEHOLDER') {
      delete parentLog.parentId;
    }
    
    const id = await createAuditLog(parentLog, database);
    ids.push(id);

    // Then create child logs that reference this parent
    // Child logs are those that have a different collection and parentId set to 'PARENT_PLACEHOLDER'
    const childLogs = logs.filter(
      (childLog) => 
        childLog.parentId === 'PARENT_PLACEHOLDER' && 
        childLog.collection !== log.collection
    );
    
    for (const childLog of childLogs) {
      const childId = await createAuditLog(
        { ...childLog, parentId: id },
        database
      );
      ids.push(childId);
    }
  }

  return ids;
}

/**
 * Get audit logs for a specific item
 */
export async function getAuditLogsForItem(
  collection: string,
  itemId: string,
  limit = 100
) {
  return await db.query.auditLogs.findMany({
    where: (logs, { eq, and }) =>
      and(eq(logs.collection, collection), eq(logs.itemId, itemId)),
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
    limit,
    with: {
      parent: true,
      children: true,
    },
  });
}

/**
 * Get audit logs for a user
 */
export async function getAuditLogsForUser(userId: string, limit = 100) {
  return await db.query.auditLogs.findMany({
    where: (logs, { eq }) => eq(logs.userId, userId),
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
    limit,
  });
}

/**
 * Get audit logs for a tenant
 */
export async function getAuditLogsForTenant(tenantId: string, limit = 100) {
  return await db.query.auditLogs.findMany({
    where: (logs, { eq }) => eq(logs.tenantId, tenantId),
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
    limit,
  });
}
