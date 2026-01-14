# BCC Events API

Backend API server for the BCC Events Registration App.

## Technology Stack

- **Bun** - Fast JavaScript runtime
- **Elysia** - Modern, ergonomic web framework optimized for Bun
- TypeScript
- **PostgreSQL** with native `postgres` driver (high performance)
- Prisma (for migrations only)
- Auth0 for authentication
- OpenAPI/Swagger for API documentation
- WebSocket support for live updates (planned)

## Features

- Multi-tenant architecture
- Auth0 JWT validation
- Three API namespaces:
  - `/api/admin` - Admin-only endpoints (requires admin role)
  - `/api/app` - End user endpoints (limited to user and relatives)
  - `/api/shared` - Shared endpoints (available to both)
- OpenAPI/Swagger documentation
- Payment provider plugin system
- Database migrations
- Real-time updates (planned)

## API Structure

### Admin Endpoints (`/api/admin`)
- Requires authentication
- Requires admin role for tenant
- Full access to tenant data
- Examples: Event management, user management, settings

### App Endpoints (`/api/app`)
- Requires authentication
- Limited to user's own data
- Can manage relatives (family members)
- Examples: Profile, registrations, personal schedule

### Shared Endpoints (`/api/shared`)
- Requires authentication
- Available to both admin and app
- Examples: Health check, public event info

## Getting Started

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Run database migrations (using Prisma)
bunx prisma migrate dev

# Start development server
bun dev
```

## API Documentation

When the server is running:
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/openapi.json

## Generate OpenAPI Spec

```bash
bun src/openapi/generate.ts
```

This generates `openapi.json` in the root directory.

## Database Migrations

```bash
bunx prisma migrate dev      # Run migrations in development
bunx prisma migrate deploy  # Deploy migrations in production
bunx prisma migrate create  # Create new migration
bunx prisma migrate status  # Check migration status
```

## Environment Variables

See `.env.example` for required environment variables.

## Authentication

All endpoints (except health check) require an Auth0 JWT token:

```
Authorization: Bearer <token>
```

For admin endpoints, also include tenant context:

```
X-Tenant-ID: <tenant-id>
```

## Database Queries

The API uses native PostgreSQL queries via the `postgres` package for maximum performance:

```typescript
import { sql } from './db/client';

const events = await sql`
  SELECT * FROM "Event"
  WHERE "tenantId" = ${tenantId}
`;
```

Note: Prisma schema uses camelCase, but PostgreSQL uses quoted identifiers for case-sensitive names.

## Best Practices

- All routes use OpenAPI/Swagger annotations
- Type-safe request/response handling
- Proper error handling with error codes
- Native SQL queries for performance
- Security headers and CORS
- Input validation ready (Zod)

## Performance

Bun provides:
- **3-4x faster** than Node.js in many benchmarks
- **Lower memory usage**
- **Native TypeScript** - no compilation step needed
- **Direct SQL** - no ORM overhead
