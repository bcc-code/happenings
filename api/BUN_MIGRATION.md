# Bun Migration Guide

## Overview

The API has been migrated from Express/Node.js to Bun with native PostgreSQL driver for maximum performance.

## Key Changes

### Runtime
- **From**: Node.js with Express
- **To**: Bun (fast JavaScript runtime)

### Database
- **From**: Prisma Client (ORM)
- **To**: Native `postgres` driver (direct SQL queries)
- **Prisma**: Still used for migrations only

### Server
- **From**: Express app
- **To**: Bun.serve() with Hono framework

## Performance Benefits

1. **Faster Startup**: Bun starts significantly faster than Node.js
2. **Native PostgreSQL**: Direct SQL queries without ORM overhead
3. **Better TypeScript**: Native TypeScript support
4. **Built-in Tools**: No need for tsx, nodemon, etc.

## Installation

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install
```

## Running

```bash
# Development (with watch mode)
bun dev

# Production
bun start

# Generate OpenAPI spec
bun src/openapi/generate.ts
```

## Database Queries

### Before (Prisma)
```typescript
const events = await prisma.event.findMany({
  where: { tenantId },
});
```

### After (Native postgres)
```typescript
const events = await sql`
  SELECT * FROM events
  WHERE tenant_id = ${tenantId}
`;
```

## Migration Notes

- All Express middleware replaced with Bun-compatible versions
- Request/Response objects use Bun's native Fetch API types
- Router implemented as lightweight custom solution
- Prisma kept only for migrations (schema management)
- All queries use native SQL for maximum performance

## Benefits

- **3-4x faster** than Node.js in many benchmarks
- **Lower memory usage**
- **Native TypeScript** - no compilation step needed
- **Built-in bundler** and package manager
- **Direct SQL** - no ORM overhead
