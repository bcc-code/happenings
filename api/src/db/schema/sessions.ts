/**
 * Session-related tables
 */

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { events } from './index';

export const sessions = pgTable(
  'Session',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('eventId').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    startTime: timestamp('startTime').notNull(),
    endTime: timestamp('endTime').notNull(),
    room: varchar('room', { length: 255 }),
    capacity: integer('capacity'),
    sessionType: varchar('sessionType', { length: 100 }),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => ({
    eventIdIdx: index('session_eventid_idx').on(table.eventId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  event: one(events, {
    fields: [sessions.eventId],
    references: [events.id],
  }),
}));
