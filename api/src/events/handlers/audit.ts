/**
 * Audit Logging Event Handler
 * 
 * Automatically creates audit logs for all create, update, and delete operations
 * Supports parent-child relationships for relationship changes
 */

import type { AfterEventContext } from '../types';
import { createAuditLog, calculateDelta, type AuditLogData } from '../../utils/audit';
import { eventEmitter } from '../emitter';

/**
 * Audit logging handler for after events
 * Creates audit logs with full context and delta tracking
 */
export async function auditLogHandler<T = unknown>(
  context: AfterEventContext<T>
): Promise<void> {
  const { payload, metadata } = context;
  const { entity, operation, userId, tenantId, userIp, userRole, entityId } = metadata;

  // Skip if no user context
  if (!userId) {
    return;
  }

  // Extract item ID from payload or metadata
  let itemId: string | undefined = entityId;

  // Try to extract ID from payload if it's an object
  if (!itemId && payload && typeof payload === 'object' && 'id' in payload) {
    itemId = (payload as any).id as string;
  }

  // If still no ID, we can't create an audit log
  if (!itemId) {
    console.warn(`Cannot create audit log: no item ID for ${entity}.${operation}`);
    return;
  }

  // Prepare audit log data
  const auditData: AuditLogData = {
    collection: entity,
    itemId,
    operation: operation as 'create' | 'update' | 'delete',
    userId,
    userIp: userIp as string | undefined,
    userRole: userRole as string | undefined,
    tenantId: tenantId as string | undefined,
    delta: {},
    oldData: undefined,
    newData: undefined,
  };

  // Handle different operations
  if (operation === 'create') {
    // For creates, all fields are new
    const newData = payload as Record<string, unknown>;
    auditData.delta = calculateDelta(null, newData);
    auditData.newData = newData;
  } else if (operation === 'update') {
    // For updates, check if payload contains audit context
    if (
      payload &&
      typeof payload === 'object' &&
      '_auditContext' in payload
    ) {
      const { _auditContext, ...newItem } = payload as {
        _auditContext: {
          existingItem: Record<string, unknown>;
          newItem: Record<string, unknown>;
        };
        [key: string]: unknown;
      };
      auditData.delta = calculateDelta(_auditContext.existingItem, _auditContext.newItem);
      auditData.oldData = _auditContext.existingItem;
      auditData.newData = _auditContext.newItem;
    } else {
      // Fallback: payload is the new item, we don't have old data
      const newData = payload as Record<string, unknown>;
      auditData.delta = calculateDelta(null, newData);
      auditData.newData = newData;
    }
  } else if (operation === 'delete') {
    // For deletes, payload should be the deleted item
    const oldData = payload as Record<string, unknown>;
    auditData.delta = calculateDelta(oldData, {});
    auditData.oldData = oldData;
  }

  // Only create audit log if there are actual changes (or it's a create/delete)
  if (
    operation === 'create' ||
    operation === 'delete' ||
    Object.keys(auditData.delta).length > 0
  ) {
    try {
      await createAuditLog(auditData);
    } catch (error) {
      // Log error but don't throw - audit logging should not break operations
      console.error('Error creating audit log:', error);
    }
  }
}

/**
 * Register audit logging handler
 * This should be called during application initialization
 */
export function registerAuditLogHandler() {
  // Register for all entities and operations
  eventEmitter.onAfter(
    '*', // All entities
    ['create', 'update', 'delete'], // All operations
    auditLogHandler,
    {
      id: 'audit-log-handler',
      priority: 0, // Normal priority
    }
  );
}
