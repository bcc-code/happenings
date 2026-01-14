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

### 1. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### 2. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create `.env` files in each directory based on `.env.example`:
- `api/.env`
- `admin-dashboard/.env`
- `end-user-app/.env`

### 3. Set Up Database

```bash
pnpm migrate
# Or
cd api && pnpm migrate
```

### 4. Start Development Servers

```bash
# From root directory - runs all services
pnpm dev

# Or individually:
pnpm dev:api      # API only
pnpm dev:admin    # Admin Dashboard only
pnpm dev:app      # End User App only

# Or from individual directories:
cd api && pnpm dev
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
