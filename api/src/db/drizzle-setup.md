# Drizzle ORM Setup Guide

## Step 1: Install Dependencies

```bash
bun add drizzle-orm
bun add -d drizzle-kit @sinclair/typebox
```

## Step 2: Create Drizzle Config

Create `drizzle.config.ts` in the `api` directory:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## Step 3: Update Database Client

Replace `src/db/client.ts` with Drizzle:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config';
import * as schema from './schema';

const connectionString = config.databaseUrl!;
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export { client as sql }; // Keep for raw SQL if needed
```

## Step 4: Create Schema

Start with a few core tables in `src/db/schema/index.ts`:

```typescript
import { pgTable, uuid, varchar, boolean, timestamp, text, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const tenants = pgTable('Tenant', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }),
  logoUrl: varchar('logoUrl', { length: 500 }),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  locale: varchar('locale', { length: 10 }).default('en'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const users = pgTable('User', {
  id: uuid('id').primaryKey().defaultRandom(),
  auth0Id: varchar('auth0Id', { length: 255 }).notNull().unique(),
  personId: varchar('personId', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
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
});

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  events: many(events),
  userAffiliations: many(userAffiliations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  affiliations: many(userAffiliations),
  registrations: many(registrations),
}));
```

## Step 5: Update Package.json Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "bun src/db/seed.ts"
  }
}
```

## Step 6: Generate Migrations

```bash
bun run db:generate
```

This will create migration files based on your schema.

## Step 7: Run Migrations

```bash
bun run db:migrate
```

## Usage Examples

### Query Users

```typescript
import { db } from './db/client';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

// Get user by auth0Id
const user = await db.query.users.findFirst({
  where: eq(users.auth0Id, auth0Id),
});

// Get user with relations
const userWithAffiliations = await db.query.users.findFirst({
  where: eq(users.auth0Id, auth0Id),
  with: {
    affiliations: {
      with: {
        tenant: true,
      },
    },
  },
});
```

### Insert

```typescript
const [newUser] = await db
  .insert(users)
  .values({
    auth0Id,
    email,
    firstName,
    lastName,
  })
  .returning();
```

### Update

```typescript
await db
  .update(users)
  .set({ lastLoginAt: new Date() })
  .where(eq(users.id, userId));
```

### Complex Queries

```typescript
import { and, or, like, gte } from 'drizzle-orm';

const events = await db
  .select()
  .from(events)
  .where(
    and(
      eq(events.tenantId, tenantId),
      eq(events.isActive, true),
      gte(events.startDate, new Date())
    )
  )
  .orderBy(events.startDate);
```

## Benefits Over Native SQL

1. **Type Safety**: All queries are type-checked
2. **IntelliSense**: Full autocomplete
3. **Refactoring**: Safe renaming
4. **Relations**: Type-safe joins
5. **Migrations**: Automatic generation
