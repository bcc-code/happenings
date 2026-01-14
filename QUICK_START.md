# Quick Start Guide

## Project Overview

BCC Events Registration App - A multi-tenant event registration system for churches worldwide.

## Project Structure

```
Happenings/
├── api/                    # Backend API (Node.js/TypeScript)
├── admin-dashboard/        # Admin UI (Vue 3/Nuxt 3)
├── end-user-app/          # End User App (Vue 3/Nuxt 3)
├── shared/                # Shared types, utils, composables
├── requirements/          # Requirements & Planning Docs
├── pnpm-workspace.yaml    # pnpm workspace configuration
├── README.md              # Main project README
├── ARCHITECTURE.md        # System architecture
├── DEVELOPMENT.md         # Development guide
├── PROJECT_STATUS.md      # Project tracking
└── CONTRIBUTING.md        # Contribution guidelines
```

## Requirements Documents

All requirements are in the `requirements/` directory:

- **PROGRAM.md** - Event scheduling, sessions, speakers
- **CATERING.md** - Meal planning, dietary requirements
- **RESOURCES.md** - Volunteer shift management
- **FINANCE.md** - Payment processing, invoicing
- **COMMUNICATION.md** - Notifications, announcements, messaging
- **FAMILY_REGISTRATIONS.md** - Family registration support
- **PAYMENT_PLUGINS.md** - Payment provider plugin system
- **MULTI_TENANCY.md** - Multi-tenant architecture
- **OFFLINE_SUPPORT.md** - Offline functionality strategy
- **AUTH0_INTEGRATION.md** - Authentication setup

## Getting Started

### Quick Setup (Recommended)

After cloning the repository, run the setup script:

```bash
# Install dependencies and set up everything
pnpm install

# Run setup script (creates .env files, sets up database, etc.)
pnpm bootstrap

# Or run setup and start all services immediately
pnpm bootstrap:start
```

The setup script will:
- ✅ Check for required tools (Bun, pnpm)
- ✅ Create `.env` files with sensible defaults (SQLite for local dev)
- ✅ Set up the database
- ✅ Optionally start all services

### Manual Setup

If you prefer to set up manually:

#### 1. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Set Up Environment Variables

Create `.env` files in each directory:
- `api/.env` - Database and API configuration
- `admin-dashboard/.env` - Frontend configuration
- `end-user-app/.env` - Frontend configuration

For local development, the setup script creates these automatically with SQLite as the database.

#### 4. Set Up Database

```bash
# Using SQLite (default for local dev)
cd api
export DB_TYPE=sqlite
export DATABASE_URL=./local.db
bun run db:push

# Or using PostgreSQL
export DATABASE_URL=postgresql://user:password@localhost:5432/dbname
bun run db:push
```

#### 5. Start Development Servers

```bash
# From root directory - runs all services
pnpm dev

# Or individually:
pnpm dev:api      # API only (port 9009)
pnpm dev:admin    # Admin Dashboard only (port 9002)
pnpm dev:app      # End User App only (port 9001)

# Or from individual directories:
cd api && bun run dev
cd admin-dashboard && pnpm dev
cd end-user-app && pnpm dev
```

## Key Features

- ✅ Multi-tenant architecture (each church is a tenant)
- ✅ Auth0 authentication
- ✅ Cross-church global events
- ✅ Family registrations (using BCC Core API SDK)
- ✅ Payment provider plugins
- ✅ Offline support (end user app)
- ✅ Live updates
- ✅ Five core modules (Program, Catering, Resources, Finance, Communication)

## Technology Stack

- **Package Manager**: pnpm (workspace)
- **Backend**: Bun (fast JavaScript runtime), TypeScript, native PostgreSQL driver
- **Frontend**: Vue 3, Nuxt 3, PrimeVue, @bcc-code/design-tokens
- **Shared**: @bcc-events/shared (types, utils, composables)
- **Auth**: Auth0
- **Database**: PostgreSQL (native `postgres` driver for performance)
- **Core API**: @bcc-code/bcc-core-api-node-sdk (family relationships, affiliations)
- **Offline**: Service Workers, IndexedDB

## Development Workflow

1. **Review Requirements**: Check `requirements/` for the module you're working on
2. **Update Requirements**: Add/update requirements before implementation
3. **Plan Database Changes**: Update Prisma schema if needed
4. **Create Migration**: Generate database migration
5. **Implement**: Build API and frontend
6. **Test**: Write and run tests
7. **Document**: Update documentation

## Important Notes

- **Requirements First**: Always update requirements documents before implementing
- **Multi-Tenancy**: All tenant-scoped data must include `tenant_id`
- **Offline Support**: End user app must work offline for viewing
- **Payment Plugins**: Churches can bring their own payment providers
- **Global Events**: Events can be marked as global for cross-church access
- **Family Registrations**: Register multiple family members together using BCC Core API SDK relationships
- **BCC Core API SDK**: Integrates with BCC Core API for user relationships and affiliations

## Next Steps

1. Review requirements documents in `requirements/`
2. Set up development environment
3. Begin implementing core infrastructure
4. Start with one module at a time

## Resources

- See `DEVELOPMENT.md` for detailed development guide
- See `ARCHITECTURE.md` for system architecture
- See `PROJECT_STATUS.md` for current progress
- See `CONTRIBUTING.md` for contribution guidelines
