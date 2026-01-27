/**
 * Permission System Schema
 * 
 * Implements a flexible group-based permission system where:
 * - Groups can be both user groups (users belong to them) and document groups (items belong to them)
 * - User groups are linked to document groups with permission levels (view, edit, manage, owner)
 * - Items are assigned to document groups based on business rules (e.g., status, tenant, etc.)
 */

import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { tenants } from './index';

// Permission level enum
export const permissionLevelEnum = pgEnum('permission_level', [
  'view',
  'edit',
  'manage',
  'owner',
]);

// Group type enum (for clarity, though all groups can serve both purposes)
export const groupTypeEnum = pgEnum('group_type', [
  'user_group',
  'document_group',
  'both', // Groups that can be both user and document groups
]);

/**
 * Groups table
 * Unified table for both user groups and document groups.
 * A group can be:
 * - A user group (users belong to it)
 * - A document group (items belong to it)
 * - Both (e.g., a user group can also be managed as a document group)
 */
export const groups = pgTable(
  'Group',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenantId').notNull(), // Groups are tenant-scoped
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(), // Unique identifier within tenant
    description: text('description'),
    type: varchar('type', { length: 50 }).default('both'), // user_group, document_group, or both
    isSystem: boolean('isSystem').default(false), // System groups (e.g., "Published", "Draft") vs user-created
    metadata: text('metadata'), // JSON string for additional metadata (e.g., business rules)
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => ({
    tenantIdIdx: index('group_tenantid_idx').on(table.tenantId),
    slugIdx: index('group_slug_idx').on(table.slug),
    tenantSlugUnique: unique('group_tenant_slug_unique').on(
      table.tenantId,
      table.slug
    ),
  })
);

/**
 * Group Members table
 * Links users to user groups (many-to-many)
 */
export const groupMembers = pgTable(
  'GroupMember',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groupId: uuid('groupId').notNull(),
    userId: uuid('userId').notNull(),
    addedAt: timestamp('addedAt').defaultNow(),
    addedBy: uuid('addedBy'), // User who added this member
  },
  (table) => ({
    groupIdIdx: index('groupmember_groupid_idx').on(table.groupId),
    userIdIdx: index('groupmember_userid_idx').on(table.userId),
    groupUserUnique: unique('groupmember_group_user_unique').on(
      table.groupId,
      table.userId
    ),
  })
);

/**
 * Group Assignments table
 * Links items/documents to document groups (many-to-many)
 * This is a polymorphic relationship - can link to any entity type
 */
export const groupAssignments = pgTable(
  'GroupAssignment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groupId: uuid('groupId').notNull(),
    entityType: varchar('entityType', { length: 100 }).notNull(), // e.g., 'Event', 'Post', 'Registration'
    entityId: uuid('entityId').notNull(), // ID of the entity
    assignedAt: timestamp('assignedAt').defaultNow(),
    assignedBy: uuid('assignedBy'), // User who made this assignment
    metadata: text('metadata'), // JSON string for additional context
  },
  (table) => ({
    groupIdIdx: index('groupassignment_groupid_idx').on(table.groupId),
    entityIdx: index('groupassignment_entity_idx').on(
      table.entityType,
      table.entityId
    ),
    groupEntityUnique: unique('groupassignment_group_entity_unique').on(
      table.groupId,
      table.entityType,
      table.entityId
    ),
  })
);

/**
 * Group Permissions table
 * Links user groups to document groups with permission levels
 * This is the core of the permission system
 */
export const groupPermissions = pgTable(
  'GroupPermission',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userGroupId: uuid('userGroupId').notNull(), // The user group
    documentGroupId: uuid('documentGroupId').notNull(), // The document group
    permissionLevel: varchar('permissionLevel', { length: 50 }).notNull(), // view, edit, manage, owner
    grantedAt: timestamp('grantedAt').defaultNow(),
    grantedBy: uuid('grantedBy'), // User who granted this permission
    metadata: text('metadata'), // JSON string for additional context
  },
  (table) => ({
    userGroupIdIdx: index('grouppermission_usergroupid_idx').on(
      table.userGroupId
    ),
    documentGroupIdIdx: index('grouppermission_documentgroupid_idx').on(
      table.documentGroupId
    ),
    userGroupDocumentGroupUnique: unique(
      'grouppermission_user_document_unique'
    ).on(table.userGroupId, table.documentGroupId),
  })
);

// Relations
export const groupsRelations = relations(groups, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [groups.tenantId],
    references: [tenants.id],
  }),
  members: many(groupMembers),
  assignments: many(groupAssignments),
  // Permissions where this group is the user group
  userGroupPermissions: many(groupPermissions, {
    relationName: 'userGroupPermissions',
  }),
  // Permissions where this group is the document group
  documentGroupPermissions: many(groupPermissions, {
    relationName: 'documentGroupPermissions',
  }),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  // Note: User relation would be defined in index.ts if we had a users relation setup
}));

export const groupAssignmentsRelations = relations(
  groupAssignments,
  ({ one }) => ({
    group: one(groups, {
      fields: [groupAssignments.groupId],
      references: [groups.id],
    }),
  })
);

export const groupPermissionsRelations = relations(
  groupPermissions,
  ({ one }) => ({
    userGroup: one(groups, {
      fields: [groupPermissions.userGroupId],
      references: [groups.id],
      relationName: 'userGroupPermissions',
    }),
    documentGroup: one(groups, {
      fields: [groupPermissions.documentGroupId],
      references: [groups.id],
      relationName: 'documentGroupPermissions',
    }),
  })
);
