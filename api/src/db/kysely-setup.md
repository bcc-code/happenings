# Kysely Setup Guide

## Step 1: Install Dependencies

```bash
bun add kysely
```

You already have `postgres` installed, which works perfectly with Kysely.

## Step 2: Define Database Types

Create `src/db/types.ts`:

```typescript
// Generated from your Prisma schema
export interface Database {
  Tenant: {
    id: string;
    name: string;
    slug: string;
    domain: string | null;
    logoUrl: string | null;
    timezone: string;
    locale: string;
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  
  User: {
    id: string;
    auth0Id: string;
    personId: string | null;
    email: string;
    emailVerified: boolean;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    timezone: string;
    locale: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
  };
  
  UserAffiliation: {
    id: string;
    userId: string;
    tenantId: string;
    role: string;
    isPrimary: boolean;
    status: string;
    joinedAt: Date;
    lastActiveAt: Date | null;
  };
  
  Event: {
    id: string;
    tenantId: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    // ... more fields
  };
  
  // Add all other tables from Prisma schema
}
```

## Step 3: Update Database Client

Replace `src/db/client.ts`:

```typescript
import { Kysely, PostgresDialect } from 'kysely';
import postgres from 'postgres';
import { config } from '../config';
import type { Database } from './types';

const connectionString = config.databaseUrl!;

// Create postgres pool
const pg = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Kysely instance
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: pg,
  }),
});

// Export postgres for raw SQL if needed
export { pg as sql };

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await pg.end();
  });
}
```

## Step 4: Update Query Helpers

Update `src/db/query-helpers.ts`:

```typescript
import { db } from './client';
import { sql } from 'kysely';

/**
 * Get user by auth0Id with affiliations
 */
export async function getUserWithAffiliations(auth0Id: string) {
  const user = await db
    .selectFrom('User')
    .selectAll('User')
    .where('auth0Id', '=', auth0Id)
    .executeTakeFirst();

  if (!user) return null;

  const affiliations = await db
    .selectFrom('UserAffiliation')
    .select([
      'tenantId',
      'role',
      'isPrimary',
    ])
    .where('userId', '=', user.id)
    .where('status', '=', 'active')
    .execute();

  return {
    ...user,
    affiliations,
  };
}

/**
 * Get events for tenant
 */
export async function getEventsForTenant(tenantId: string) {
  return await db
    .selectFrom('Event')
    .selectAll()
    .where('tenantId', '=', tenantId)
    .orderBy('startDate', 'desc')
    .execute();
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  return await db
    .selectFrom('User')
    .select([
      'id',
      'email',
      'firstName',
      'lastName',
      'phone',
      'avatarUrl',
      'timezone',
      'locale',
    ])
    .where('id', '=', userId)
    .executeTakeFirst();
}
```

## Step 5: Usage Examples

### Simple Query

```typescript
import { db } from './db/client';

const user = await db
  .selectFrom('User')
  .selectAll()
  .where('email', '=', 'user@example.com')
  .executeTakeFirst();
```

### Join Query

```typescript
const userWithTenants = await db
  .selectFrom('User')
  .innerJoin('UserAffiliation', 'User.id', 'UserAffiliation.userId')
  .innerJoin('Tenant', 'UserAffiliation.tenantId', 'Tenant.id')
  .select([
    'User.id',
    'User.email',
    'UserAffiliation.role',
    'Tenant.name as tenantName',
  ])
  .where('User.auth0Id', '=', auth0Id)
  .where('UserAffiliation.status', '=', 'active')
  .execute();
```

### Insert

```typescript
const [newUser] = await db
  .insertInto('User')
  .values({
    auth0Id,
    email,
    firstName,
    lastName,
    emailVerified: false,
    timezone: 'UTC',
    locale: 'en',
  })
  .returningAll()
  .execute();
```

### Update

```typescript
await db
  .updateTable('User')
  .set({ lastLoginAt: new Date() })
  .where('id', '=', userId)
  .execute();
```

### Complex Query

```typescript
import { sql } from 'kysely';

const events = await db
  .selectFrom('Event')
  .selectAll()
  .where('tenantId', '=', tenantId)
  .where('isActive', '=', true)
  .where('startDate', '>=', sql`NOW()`)
  .orderBy('startDate', 'asc')
  .limit(10)
  .execute();
```

### Raw SQL (when needed)

```typescript
import { sql } from 'kysely';

const result = await sql<{ count: number }>`
  SELECT COUNT(*) as count
  FROM "Event"
  WHERE "tenantId" = ${tenantId}
`.execute();

const count = result.rows[0].count;
```

## Step 6: Keep Prisma for Migrations

You can keep using Prisma for migrations:

```json
{
  "scripts": {
    "migrate": "bunx prisma migrate dev",
    "migrate:deploy": "bunx prisma migrate deploy",
    "db:studio": "bunx prisma studio"
  }
}
```

## Benefits

1. **Type Safety**: Full TypeScript inference
2. **Performance**: Minimal overhead
3. **Control**: Full control over SQL
4. **Familiar**: SQL-like syntax
5. **Flexible**: Can use raw SQL when needed
6. **Migrations**: Keep Prisma for migrations

## Type Generation (Optional)

You can generate types from Prisma schema:

```bash
bun add -d prisma-kysely
```

Then generate types:

```typescript
import { Prisma } from '@prisma/client';
import { Kysely } from 'kysely';

type Database = Prisma.Database;
export const db = new Kysely<Database>({ ... });
```
