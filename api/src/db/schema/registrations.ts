/**
 * Registration-related tables
 */

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, events } from './index';

export const registrations = pgTable(
  'Registration',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId').notNull(),
    eventId: uuid('eventId').notNull(),
    tenantId: uuid('tenantId').notNull(),
    familyRegistrationId: uuid('familyRegistrationId'),
    pricingTierId: uuid('pricingTierId'),
    basePrice: decimal('basePrice', { precision: 10, scale: 2 }).default('0'),
    discountAmount: decimal('discountAmount', { precision: 10, scale: 2 }).default('0'),
    taxAmount: decimal('taxAmount', { precision: 10, scale: 2 }).default('0'),
    totalAmount: decimal('totalAmount', { precision: 10, scale: 2 }).default('0'),
    currency: varchar('currency', { length: 3 }).default('USD'),
    status: varchar('status', { length: 50 }).default('pending'),
    registeredAt: timestamp('registeredAt').defaultNow(),
    paymentDueDate: timestamp('paymentDueDate'),
  },
  (table) => ({
    userIdIdx: index('registration_userid_idx').on(table.userId),
    eventIdIdx: index('registration_eventid_idx').on(table.eventId),
    tenantIdIdx: index('registration_tenantid_idx').on(table.tenantId),
    statusIdx: index('registration_status_idx').on(table.status),
    familyRegistrationIdIdx: index('registration_familyregistrationid_idx').on(
      table.familyRegistrationId
    ),
  })
);

export const registrationsRelations = relations(registrations, ({ one }) => ({
  user: one(users, {
    fields: [registrations.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [registrations.eventId],
    references: [events.id],
  }),
}));
