/**
 * Audit Log Schema
 * 
 * Tracks all data changes with full context:
 * - When, by whom (user id, IP), in what role, with what tenant
 * - On what collection and item
 * - Delta changes (what actually changed)
 * - Parent-child relationships for relationship updates
 */

import { relations } from 'drizzle-orm';
import {
    index,
    jsonb,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

export const auditLogs = pgTable(
  'AuditLog',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    
    // Parent relationship (for relationship changes)
    parentId: uuid('parentId'), // References another AuditLog.id
    
    // What was changed
    collection: varchar('collection', { length: 255 }).notNull(), // Table/entity name
    itemId: uuid('itemId').notNull(), // ID of the item that was changed
    
    // Operation type
    operation: varchar('operation', { length: 50 }).notNull(), // 'create', 'update', 'delete'
    
    // Who made the change
    userId: uuid('userId').notNull(), // User who made the change
    userIp: varchar('userIp', { length: 45 }), // IP address (supports IPv6)
    userRole: varchar('userRole', { length: 50 }), // Role at time of change
    
    // Tenant context
    tenantId: uuid('tenantId'), // Tenant context (if applicable)
    
    // What changed (delta)
    delta: jsonb('delta').notNull(), // JSON object with old/new values for changed fields
    // Format: { fieldName: { old: value, new: value }, ... }
    
    // Full data snapshots (optional, for debugging)
    oldData: jsonb('oldData'), // Full old state (before change)
    newData: jsonb('newData'), // Full new state (after change)
    
    // Timestamp
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    // Indexes for common queries
    collectionItemIdx: index('auditlog_collection_item_idx').on(
      table.collection,
      table.itemId
    ),
    userIdIdx: index('auditlog_userid_idx').on(table.userId),
    tenantIdIdx: index('auditlog_tenantid_idx').on(table.tenantId),
    createdAtIdx: index('auditlog_createdat_idx').on(table.createdAt),
    parentIdIdx: index('auditlog_parentid_idx').on(table.parentId),
    operationIdx: index('auditlog_operation_idx').on(table.operation),
  })
);

// Self-referential relation for parent-child audit logs
// Note: Using a function to avoid circular reference issues during schema initialization
export const auditLogsRelations = relations(auditLogs, ({ one, many }) => {
  return {
    parent: one(auditLogs, {
      fields: [auditLogs.parentId],
      references: [auditLogs.id],
    }),
    children: many(auditLogs),
  };
});
