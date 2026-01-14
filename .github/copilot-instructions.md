# BCC Events Registration App - Development Rules

## Project Overview

Multi-tenant event registration application for BCC Events with three main components:
- **API**: Backend server (Bun + Elysia)
- **Admin Dashboard**: Admin interface (Nuxt 3 + Vue 3)
- **End User App**: End-user interface (Nuxt 3 + Vue 3)

## Technology Stack

### Backend (API)
- **Runtime**: Bun (NOT Node.js)
- **Framework**: Elysia (NOT Express, NOT Hono, NOT Bao.js)
- **ORM**: Drizzle ORM (NOT Prisma, NOT Kysely)
- **Database**: PostgreSQL with native `postgres` driver
- **Migrations**: drizzle-kit (NOT Prisma migrations)
- **Auth**: Auth0 (JWT validation)
- **Language**: TypeScript

### Frontend (Admin Dashboard & End User App)
- **Framework**: Nuxt 3
- **UI Library**: Vue 3
- **Component Library**: PrimeVue (configured with @bcc-code/design-tokens)
- **Design Tokens**: @bcc-code/design-tokens (MUST be used for all styling)
- **Auth**: @auth0/auth0-vue (NOT @nuxtjs/auth0)
- **PWA**: @nuxtjs/pwa@^3.3.5 (for end-user-app only)
- **Language**: TypeScript

### Package Management
- **Package Manager**: pnpm (workspaces)
- **Workspace Structure**: Monorepo with shared package

### Infrastructure
- **IaC**: Terraform
- **Cloud**: Google Cloud Platform (GCP)
- **Services**: Cloud SQL (PostgreSQL), Memorystore (Redis), Cloud Storage, Cloud Run

## Project Structure

```
/
├── api/                    # Backend API (Bun + Elysia)
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema/     # Drizzle schema files
│   │   │   └── client.ts   # Drizzle database client
│   │   ├── routes/
│   │   │   ├── admin/      # Admin-only endpoints
│   │   │   ├── app/        # End-user endpoints
│   │   │   └── shared/     # Shared endpoints
│   │   ├── middleware/     # Auth, tenant, error handling
│   │   └── index.ts        # Elysia server entry
│   └── drizzle.config.ts   # Drizzle Kit configuration
├── admin-dashboard/        # Admin frontend (Nuxt 3)
├── end-user-app/           # End-user frontend (Nuxt 3)
├── shared/                 # Shared types, utils, composables
└── infra/                  # Terraform infrastructure
```

## API Architecture

### Three Namespaces

1. **Admin** (`/api/admin`)
   - Requires: Authentication + Admin role
   - Tenant context required
   - Full access to tenant data
   - Example: Event management, user management

2. **App** (`/api/app`)
   - Requires: Authentication
   - Limited to user's own data
   - Can manage relatives (family members)
   - Example: Profile, personal registrations

3. **Shared** (`/api/shared`)
   - Requires: Authentication
   - Available to both admin and app users
   - Example: Health check, public event info

### Authentication & Authorization

- All endpoints (except `/health`) require Auth0 JWT token
- Admin endpoints require specific role (super_admin, admin, event_manager)
- Tenant context extracted from header (`X-Tenant-ID`) or query param
- User access control for relatives via family groups

## Database

### ORM: Drizzle ORM

- **DO NOT USE**: Prisma Client, Kysely, or raw SQL helpers
- **USE**: Drizzle ORM with drizzle-kit for migrations
- Schema defined in `api/src/db/schema/`
- Relations defined using Drizzle's `relations()` function
- Migrations generated with `bun run db:generate`
- Migrations applied with `bun run db:migrate`

### Schema Organization

- Core tables in `schema/index.ts` (Tenant, User, UserAffiliation, Event)
- Related tables in separate files (sessions.ts, speakers.ts, etc.)
- Use Drizzle's type-safe query API: `db.query.tableName.findFirst()`

### Example Queries

```typescript
// ✅ CORRECT - Use Drizzle
import { db } from './db/client';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

const user = await db.query.users.findFirst({
  where: eq(users.auth0Id, auth0Id),
  with: { affiliations: true },
});

// ❌ WRONG - Don't use Prisma
// const user = await prisma.user.findFirst(...)

// ❌ WRONG - Don't use raw SQL unless absolutely necessary
// const user = await sql`SELECT * FROM "User" ...`
```

## Backend Development Rules

### Server Setup

- Use Elysia framework (NOT Express, NOT Hono)
- Use Bun.serve() or Elysia's `.listen()`
- CORS via `@elysiajs/cors`
- Error handling via `app.onError()`
- 404 handling via `app.notFound()`

### Middleware

- Auth middleware: `verifyToken()`, `requireAuth()`, `requireAdmin()`
- Tenant middleware: `tenantContext()`
- Use Elysia's `onBeforeHandle` hooks for middleware

### Routes

- Group routes by namespace (admin, app, shared)
- Use `app.group()` to mount sub-routers
- Export route handlers as functions
- Use Elysia context: `{ store, request }`

### Database

- Always use Drizzle ORM (NOT Prisma, NOT raw SQL)
- Use `db.query.tableName` for queries with relations
- Use `db.select().from(table).where()` for complex queries
- Keep raw SQL (`sql` export) only for edge cases

### Type Safety

- Use TypeScript strictly
- Leverage Drizzle's type inference
- Define types in `shared/` package when shared across apps
- Use Elysia's context types

## Frontend Development Rules

### Nuxt 3

- Use Nuxt 3 (NOT Nuxt 2)
- Use Vue 3 Composition API
- Use `<script setup>` syntax
- Use TypeScript

### UI Components

- **MUST use PrimeVue** for all UI components (NOT custom components unless absolutely necessary)
- **MUST configure PrimeVue with @bcc-code/design-tokens** for theming
- Use @bcc-code/design-tokens for all colors, spacing, typography, and design values
- Follow PrimeVue patterns and best practices
- Create a PrimeVue plugin to configure design tokens on app initialization
- Never hardcode colors, spacing, or design values - always use design tokens

### Authentication

- Use `@auth0/auth0-vue` (NOT @nuxtjs/auth0)
- Create Auth0 plugin in `plugins/auth0.client.ts`
- Use Auth0 composables for user state

### PWA (End User App Only)

- Use `@nuxtjs/pwa@^3.3.5` (NOT older versions)
- Configure service workers for offline support
- Use IndexedDB for offline data storage

## Package Management

### pnpm Workspaces

- Use `pnpm` (NOT npm, NOT yarn)
- Workspace protocol: `@bcc-events/shared: workspace:*`
- Run commands: `pnpm --filter <package> <command>`
- Install: `pnpm install` (from root)

### Dependencies

- Always use latest stable versions
- Check package compatibility before adding
- Use workspace dependencies for internal packages
- Pin versions for critical dependencies

## Code Style

### TypeScript

- Use strict mode
- Prefer type inference where possible
- Use interfaces for object shapes
- Use types for unions/intersections

### Naming Conventions

- Files: kebab-case (e.g., `query-helpers.ts`)
- Functions: camelCase (e.g., `getUserById`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- Types/Interfaces: PascalCase (e.g., `AuthenticatedContext`)

### File Organization

- Group related functionality
- Use index files for clean exports
- Keep files focused and small
- Document complex logic

## Testing

- Write tests for critical paths
- Use Bun's built-in test runner
- Test API endpoints
- Test database queries

## Documentation

- Document API endpoints with OpenAPI/Swagger
- Keep README files updated
- Document complex business logic
- Update requirements files when adding features

## Git Workflow

- Use meaningful commit messages
- Keep commits focused
- Update documentation with code changes
- Don't commit generated files

## Common Mistakes to Avoid

### ❌ DON'T

- Use Prisma Client (we use Drizzle)
- Use Express or Hono (we use Elysia)
- Use Node.js runtime (we use Bun)
- Use npm or yarn (we use pnpm)
- Use @nuxtjs/auth0 (we use @auth0/auth0-vue)
- Use old @nuxtjs/pwa versions (use ^3.3.5)
- Use raw SQL when Drizzle can handle it
- Create custom routers (use Elysia's built-in routing)
- Hardcode colors, spacing, or design values (use @bcc-code/design-tokens)
- Use other UI libraries (use PrimeVue only)
- Create custom components when PrimeVue has equivalent

### ✅ DO

- Use Drizzle ORM for all database operations
- Use Elysia framework for API
- Use Bun runtime
- Use pnpm for package management
- Use latest stable package versions
- Use TypeScript strictly
- Use workspace dependencies for shared code
- Follow the three namespace pattern (admin, app, shared)
- Use PrimeVue components for all UI
- Configure PrimeVue with @bcc-code/design-tokens
- Use design tokens for all styling (colors, spacing, typography)

## When Adding New Features

1. **Check requirements files** in `requirements/` directory
2. **Update schema** in `api/src/db/schema/` if needed
3. **Generate migration**: `bun run db:generate`
4. **Add API routes** in appropriate namespace
5. **Update OpenAPI docs** with Swagger annotations
6. **Add frontend components** using PrimeVue (configured with design tokens)
7. **Use design tokens** for all styling - never hardcode values
8. **Update documentation**

## Performance Considerations

- Use Drizzle's query API for type-safe, optimized queries
- Leverage Bun's performance benefits
- Use connection pooling for database
- Cache frequently accessed data
- Optimize database queries (avoid N+1)

## Security

- Always validate Auth0 tokens
- Check tenant access before data operations
- Validate user permissions
- Use parameterized queries (Drizzle handles this)
- Sanitize user input
- Follow Auth0 best practices

## Questions?

When in doubt:
1. Check existing code patterns
2. Follow framework documentation (Elysia, Drizzle, Nuxt)
3. Maintain consistency with existing codebase
4. Ask for clarification if needed
