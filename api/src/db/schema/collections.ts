/**
 * Collections Schema
 * Dynamic collections system for super admin
 */

import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Collection metadata table
export const collections = pgTable(
  'Collection',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description'),
    tableName: varchar('tableName', { length: 255 }).notNull().unique(),
    isActive: boolean('isActive').default(true),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
    createdBy: uuid('createdBy'), // User ID who created this collection
  },
  (table) => ({
    slugIdx: index('collection_slug_idx').on(table.slug),
    tableNameIdx: index('collection_tablename_idx').on(table.tableName),
    slugUnique: unique('collection_slug_unique').on(table.slug),
  })
);

// Collection field definitions
export const collectionFields = pgTable(
  'CollectionField',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    collectionId: uuid('collectionId').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // text, number, boolean, date, json, etc.
    isRequired: boolean('isRequired').default(false),
    isUnique: boolean('isUnique').default(false),
    defaultValue: text('defaultValue'),
    validation: jsonb('validation'), // JSON schema for validation rules
    displayOrder: integer('displayOrder').default(0),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => ({
    collectionIdIdx: index('collectionfield_collectionid_idx').on(table.collectionId),
    slugIdx: index('collectionfield_slug_idx').on(table.slug),
    collectionSlugUnique: unique('collectionfield_collection_slug_unique').on(
      table.collectionId,
      table.slug
    ),
  })
);

// Relations
export const collectionsRelations = relations(collections, ({ many }) => ({
  fields: many(collectionFields),
}));

export const collectionFieldsRelations = relations(collectionFields, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionFields.collectionId],
    references: [collections.id],
  }),
}));
