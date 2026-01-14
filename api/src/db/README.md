# Database Layer

## Overview

The API uses native PostgreSQL queries via the `postgres` package for maximum performance. Prisma is only used for migrations and schema management.

## Connection

The database client is initialized in `src/db/client.ts`:

```typescript
import { sql } from './db/client';

// Direct SQL queries
const events = await sql`
  SELECT * FROM "Event"
  WHERE "tenantId" = ${tenantId}
`;
```

## Query Helpers

Common queries are abstracted in `src/db/query-helpers.ts`:

- `getUserWithAffiliations(auth0Id)` - Get user with affiliations
- `getEventsForTenant(tenantId)` - Get events for tenant
- `getUserById(userId)` - Get user by ID

## Prisma Schema vs PostgreSQL

**Important**: Prisma uses camelCase in the TypeScript schema, but PostgreSQL uses quoted identifiers for case-sensitive table/column names.

- Prisma model: `User` → PostgreSQL table: `"User"`
- Prisma field: `auth0Id` → PostgreSQL column: `"auth0Id"`
- Prisma field: `tenantId` → PostgreSQL column: `"tenantId"`

Always use quoted identifiers in SQL queries to match Prisma's naming.

## Example Queries

### Select with joins
```typescript
const users = await sql`
  SELECT u.*, ua."tenantId"
  FROM "User" u
  LEFT JOIN "UserAffiliation" ua ON u.id = ua."userId"
  WHERE u."auth0Id" = ${auth0Id}
`;
```

### Insert
```typescript
const [newUser] = await sql`
  INSERT INTO "User" ("auth0Id", email, "firstName", "lastName")
  VALUES (${auth0Id}, ${email}, ${firstName}, ${lastName})
  RETURNING *
`;
```

### Update
```typescript
await sql`
  UPDATE "User"
  SET "lastLoginAt" = NOW()
  WHERE id = ${userId}
`;
```

### Delete
```typescript
await sql`
  DELETE FROM "Event"
  WHERE id = ${eventId} AND "tenantId" = ${tenantId}
`;
```

## Performance Tips

1. Use parameterized queries (always use `${variable}` syntax)
2. Use indexes (defined in Prisma schema)
3. Use connection pooling (configured in client.ts)
4. Use transactions for multi-step operations
5. Avoid N+1 queries - use JOINs when possible

## Transactions

```typescript
await sql.begin(async (sql) => {
  await sql`INSERT INTO ...`;
  await sql`UPDATE ...`;
  // All or nothing
});
```

## Error Handling

The `postgres` package throws errors that should be caught:

```typescript
try {
  const result = await sql`SELECT ...`;
} catch (error) {
  // Handle database error
  console.error('Database error:', error);
  throw new ApiError(500, 'Database error', 'DB_ERROR');
}
```
