# Drizzle ORM Recommendation

## Why Drizzle ORM?

**Drizzle ORM** is the best choice for a type-safe ORM with Bun and Elysia because:

### ✅ Advantages

1. **Type Safety**: Full TypeScript support with end-to-end type inference
2. **Performance**: Lightweight with minimal overhead - faster than Prisma
3. **SQL-like Syntax**: Familiar SQL syntax, not an abstraction layer
4. **Bun Optimized**: Works seamlessly with Bun runtime
5. **Elysia Integration**: Excellent integration with Elysia framework
6. **Migrations**: Built-in migration generation and management
7. **Flexibility**: Can use raw SQL when needed
8. **Active Development**: Actively maintained and growing ecosystem

### 📊 Comparison

| Feature | Drizzle | Prisma | Kysely | Native SQL |
|---------|---------|--------|--------|------------|
| Type Safety | ✅ Excellent | ✅ Excellent | ✅ Excellent | ❌ None |
| Performance | ✅ Fast | ⚠️ Slower | ✅ Fast | ✅ Fastest |
| Learning Curve | ✅ Easy | ⚠️ Medium | ✅ Easy | ⚠️ Hard |
| Migrations | ✅ Built-in | ✅ Built-in | ❌ Manual | ❌ Manual |
| SQL-like | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| Bun Support | ✅ Excellent | ⚠️ Good | ✅ Good | ✅ Native |

## Installation

```bash
bun add drizzle-orm postgres
bun add -d drizzle-kit @sinclair/typebox
```

## Setup

### 1. Database Client

```typescript
// src/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config';
import * as schema from './schema';

const connectionString = config.databaseUrl!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
export { client };
```

### 2. Schema Definition

```typescript
// src/db/schema/index.ts
import { pgTable, uuid, varchar, boolean, timestamp, text } from 'drizzle-orm/pg-core';

export const users = pgTable('User', {
  id: uuid('id').primaryKey().defaultRandom(),
  auth0Id: varchar('auth0Id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('emailVerified').default(false),
  firstName: varchar('firstName', { length: 255 }),
  lastName: varchar('lastName', { length: 255 }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const tenants = pgTable('Tenant', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});
```

### 3. Usage Example

```typescript
import { db } from './db/client';
import { users, tenants } from './db/schema';
import { eq, and } from 'drizzle-orm';

// Type-safe queries
const allUsers = await db.select().from(users);

const user = await db.query.users.findFirst({
  where: eq(users.auth0Id, auth0Id),
  with: {
    affiliations: true, // Relations
  },
});

const events = await db
  .select()
  .from(events)
  .where(and(
    eq(events.tenantId, tenantId),
    eq(events.isActive, true)
  ));
```

## Migration from Native SQL

### Benefits

1. **Type Safety**: Catch errors at compile time
2. **IntelliSense**: Full autocomplete for tables and columns
3. **Refactoring**: Safe renaming with TypeScript
4. **Relations**: Type-safe joins and relations
5. **Migrations**: Automatic migration generation

### Migration Strategy

1. Keep Prisma schema for reference
2. Convert to Drizzle schema gradually
3. Use Drizzle for new features
4. Migrate existing queries over time

## Configuration

### drizzle.config.ts

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

### Package.json Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Elysia + Drizzle Integration](https://elysiajs.com/integrations/drizzle)
- [Drizzle GitHub](https://github.com/drizzle-team/drizzle-orm)
