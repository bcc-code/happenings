/**
 * Drizzle ORM Schema
 * Converted from Prisma schema
 */

import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('role', [
  'super_admin',
  'admin',
  'event_manager',
  'user',
]);

export const statusEnum = pgEnum('status', [
  'active',
  'inactive',
]);

export const registrationStatusEnum = pgEnum('registration_status', [
  'pending',
  'confirmed',
  'cancelled',
]);

export const shiftTypeEnum = pgEnum('shift_type', [
  'pre',
  'during',
  'post',
]);

export const shiftPriorityEnum = pgEnum('shift_priority', [
  'low',
  'normal',
  'high',
  'critical',
]);

// Tenants (Churches)
export const tenants = pgTable(
  'Tenant',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    domain: varchar('domain', { length: 255 }),
    logoUrl: varchar('logoUrl', { length: 500 }),
    primaryColor: varchar('primaryColor', { length: 50 }),
    secondaryColor: varchar('secondaryColor', { length: 50 }),
    timezone: varchar('timezone', { length: 50 }).default('UTC'),
    locale: varchar('locale', { length: 10 }).default('en'),
    currency: varchar('currency', { length: 3 }).default('USD'),
    isActive: boolean('isActive').default(true),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => ({
    slugIdx: index('tenant_slug_idx').on(table.slug),
    domainIdx: index('tenant_domain_idx').on(table.domain),
    slugUnique: unique('tenant_slug_unique').on(table.slug),
    domainUnique: unique('tenant_domain_unique').on(table.domain),
  })
);

// Users (Central database, not tenant-scoped)
export const users = pgTable(
  'User',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    auth0Id: varchar('auth0Id', { length: 255 }).notNull(),
    personId: varchar('personId', { length: 255 }), // BCC Core API SDK Person ID
    email: varchar('email', { length: 255 }).notNull(),
    emailVerified: boolean('emailVerified').default(false),
    firstName: varchar('firstName', { length: 255 }),
    lastName: varchar('lastName', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    avatarUrl: varchar('avatarUrl', { length: 500 }),
    timezone: varchar('timezone', { length: 50 }).default('UTC'),
    locale: varchar('locale', { length: 10 }).default('en'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
    lastLoginAt: timestamp('lastLoginAt'),
  },
  (table) => ({
    auth0IdIdx: index('user_auth0id_idx').on(table.auth0Id),
    emailIdx: index('user_email_idx').on(table.email),
    personIdIdx: index('user_personid_idx').on(table.personId),
    auth0IdUnique: unique('user_auth0id_unique').on(table.auth0Id),
    emailUnique: unique('user_email_unique').on(table.email),
    personIdUnique: unique('user_personid_unique').on(table.personId),
  })
);

// User-Church Affiliations (Many-to-Many)
export const userAffiliations = pgTable(
  'UserAffiliation',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId').notNull(),
    tenantId: uuid('tenantId').notNull(),
    role: varchar('role', { length: 50 }).default('user'),
    isPrimary: boolean('isPrimary').default(false),
    status: varchar('status', { length: 50 }).default('active'),
    joinedAt: timestamp('joinedAt').defaultNow(),
    lastActiveAt: timestamp('lastActiveAt'),
  },
  (table) => ({
    userIdIdx: index('useraffiliation_userid_idx').on(table.userId),
    tenantIdIdx: index('useraffiliation_tenantid_idx').on(table.tenantId),
    userTenantUnique: unique('useraffiliation_user_tenant_unique').on(
      table.userId,
      table.tenantId
    ),
  })
);

// Events (Tenant-scoped, but can be global)
export const events = pgTable(
  'Event',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenantId').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    startDate: timestamp('startDate').notNull(),
    endDate: timestamp('endDate').notNull(),
    venue: varchar('venue', { length: 255 }),
    capacity: integer('capacity'),
    registrationOpen: timestamp('registrationOpen'),
    registrationClose: timestamp('registrationClose'),
    isGlobal: boolean('isGlobal').default(false),
    globalAccessRules: jsonb('globalAccessRules'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => ({
    tenantIdIdx: index('event_tenantid_idx').on(table.tenantId),
    isGlobalIdx: index('event_isglobal_idx').on(table.isGlobal),
    startDateIdx: index('event_startdate_idx').on(table.startDate),
  })
);

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  events: many(events),
  userAffiliations: many(userAffiliations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  affiliations: many(userAffiliations),
}));

export const userAffiliationsRelations = relations(userAffiliations, ({ one }) => ({
  user: one(users, {
    fields: [userAffiliations.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [userAffiliations.tenantId],
    references: [tenants.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  tenant: one(tenants, {
    fields: [events.tenantId],
    references: [tenants.id],
  }),
}));

// Export all tables
export * from './audit';
export * from './cache';
export * from './collections';
export * from './communication';
export * from './family';
export * from './finance';
export * from './meals';
export * from './registrations';
export * from './sessions';
export * from './shifts';
export * from './speakers';

