# Drizzle ORM Migration Guide

## Overview

We've migrated from Prisma to **Drizzle ORM** for type-safe database queries. Prisma is no longer needed - Drizzle handles both queries and migrations.

## What Changed

### Removed
- ❌ Prisma (`prisma` package)
- ❌ Prisma Client (`@prisma/client`)
- ❌ Prisma schema file (converted to Drizzle schema)

### Added
- ✅ Drizzle ORM (`drizzle-orm`)
- ✅ Drizzle Kit (`drizzle-kit`) for migrations
- ✅ Drizzle schema files in `src/db/schema/`

## Installation

```bash
bun install
```

## Schema Structure

The schema is organized in modules:

```
src/db/schema/
├── index.ts          # Core tables (Tenant, User, UserAffiliation, Event)
├── sessions.ts       # Session-related tables
├── speakers.ts       # Speaker-related tables
├── registrations.ts  # Registration tables
├── family.ts         # Family group tables
├── shifts.ts         # Volunteer shift tables (placeholder)
├── meals.ts          # Meal-related tables (placeholder)
├── finance.ts        # Finance tables (placeholder)
└── communication.ts  # Communication tables (placeholder)
```

## Migrations

### Generate Migration

```bash
bun run db:generate
```

This creates migration files in `src/db/migrations/` based on schema changes.

### Apply Migrations

```bash
bun run db:migrate
```

### Push Schema (Development)

For development, you can push schema directly without migrations:

```bash
bun run db:push
```

### Studio (Database Browser)

```bash
bun run db:studio
```

## Usage Examples

### Query with Relations

```typescript
import { db } from './db/client';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

// Get user with affiliations
const user = await db.query.users.findFirst({
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
import { and, or, gte, desc } from 'drizzle-orm';

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
  .orderBy(desc(events.startDate))
  .limit(10);
```

## Benefits

1. **Type Safety**: Full TypeScript inference
2. **Performance**: Lightweight, fast queries
3. **Migrations**: Built-in migration tool
4. **Relations**: Type-safe relations
5. **SQL-like**: Familiar SQL syntax
6. **No Prisma**: One less dependency

## Migration from Prisma

The Prisma schema has been converted to Drizzle. Key differences:

- **Tables**: Prisma `model` → Drizzle `pgTable`
- **Fields**: Prisma `@id`, `@default()` → Drizzle `.primaryKey()`, `.default()`
- **Relations**: Prisma `@relation` → Drizzle `relations()`
- **Indexes**: Prisma `@@index` → Drizzle `index()`

## Next Steps

1. Install dependencies: `bun install`
2. Generate initial migration: `bun run db:generate`
3. Review migration files in `src/db/migrations/`
4. Apply migrations: `bun run db:migrate`
5. Update any remaining Prisma queries to Drizzle

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Drizzle Kit Docs](https://orm.drizzle.team/kit-docs/overview)
- [Elysia + Drizzle](https://elysiajs.com/integrations/drizzle)
