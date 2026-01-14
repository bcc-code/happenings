/**
 * Speaker-related tables
 */

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './index';

export const speakers = pgTable(
  'Speaker',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenantId').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    bio: text('bio'),
    photoUrl: varchar('photoUrl', { length: 500 }),
    email: varchar('email', { length: 255 }),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => ({
    tenantIdIdx: index('speaker_tenantid_idx').on(table.tenantId),
  })
);

export const speakersRelations = relations(speakers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [speakers.tenantId],
    references: [tenants.id],
  }),
}));
