/**
 * Family-related tables
 */

import {
  boolean,
  decimal,
  index,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const familyGroups = pgTable(
  'FamilyGroup',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenantId').notNull(),
    name: varchar('name', { length: 255 }),
    primaryContactId: uuid('primaryContactId').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => ({
    tenantIdIdx: index('familygroup_tenantid_idx').on(table.tenantId),
    primaryContactIdIdx: index('familygroup_primarycontactid_idx').on(
      table.primaryContactId
    ),
  })
);

export const familyGroupMembers = pgTable(
  'FamilyGroupMember',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    familyGroupId: uuid('familyGroupId').notNull(),
    userId: uuid('userId').notNull(),
    relationshipType: varchar('relationshipType', { length: 50 }),
    isPrimaryContact: boolean('isPrimaryContact').default(false),
    addedAt: timestamp('addedAt').defaultNow(),
    addedBy: uuid('addedBy'),
  },
  (table) => ({
    familyGroupIdIdx: index('familygroupmember_familygroupid_idx').on(
      table.familyGroupId
    ),
    userIdIdx: index('familygroupmember_userid_idx').on(table.userId),
    familyGroupUserUnique: unique('familygroupmember_familygroup_user_unique').on(
      table.familyGroupId,
      table.userId
    ),
  })
);

export const familyRegistrations = pgTable(
  'FamilyRegistration',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    familyGroupId: uuid('familyGroupId').notNull(),
    eventId: uuid('eventId').notNull(),
    tenantId: uuid('tenantId').notNull(),
    primaryContactId: uuid('primaryContactId').notNull(),
    status: varchar('status', { length: 50 }).default('pending'),
    familyDiscount: decimal('familyDiscount', { precision: 10, scale: 2 }).default('0'),
    totalAmount: decimal('totalAmount', { precision: 10, scale: 2 }).default('0'),
    currency: varchar('currency', { length: 3 }).default('USD'),
    registeredAt: timestamp('registeredAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => ({
    familyGroupIdIdx: index('familyregistration_familygroupid_idx').on(
      table.familyGroupId
    ),
    eventIdIdx: index('familyregistration_eventid_idx').on(table.eventId),
    tenantIdIdx: index('familyregistration_tenantid_idx').on(table.tenantId),
    primaryContactIdIdx: index('familyregistration_primarycontactid_idx').on(
      table.primaryContactId
    ),
    statusIdx: index('familyregistration_status_idx').on(table.status),
    familyGroupEventUnique: unique('familyregistration_familygroup_event_unique').on(
      table.familyGroupId,
      table.eventId
    ),
  })
);

// Relations will be added when all imports are available
// For now, export tables only
