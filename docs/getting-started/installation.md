# Installation Guide

## Prerequisites

- **Bun** >= 1.0.0 (install: `curl -fsSL https://bun.sh/install | bash`)
- **pnpm** >= 8.0.0
- **PostgreSQL** (for production) or SQLite (for local development)

## Quick Setup (Recommended)

After cloning the repository, run the setup script:

```bash
# Install dependencies
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

## Manual Setup

If you prefer to set up manually:

### 1. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create `.env` files in each directory:
- `api/.env` - Database and API configuration
- `admin-dashboard/.env` - Frontend configuration
- `end-user-app/.env` - Frontend configuration

For local development, the setup script creates these automatically with SQLite as the database.

### 4. Set Up Database

#### Using SQLite (Default for Local Dev)

```bash
cd api
export DB_TYPE=sqlite
export DATABASE_URL=./local.db
bun run db:push
```

#### Using PostgreSQL

```bash
cd api
export DATABASE_URL=postgresql://user:password@localhost:5432/dbname
bun run db:push
```

### 5. Start Development Servers

```bash
# From root directory - runs all services
pnpm dev

# Or individually:
pnpm dev:api      # API only (port 9000)
pnpm dev:admin    # Admin Dashboard only (port 9002)
pnpm dev:app      # End User App only (port 9001)

# Or from individual directories:
cd api && bun run dev
cd admin-dashboard && pnpm dev
cd end-user-app && pnpm dev
```

## Database Migrations

```bash
# Create a new migration
cd api
bun run db:generate

# Apply migrations
bun run db:migrate

# Check migration status
bun run db:status
```

## Troubleshooting

### Database Connection Issues

- Check `DATABASE_URL` environment variable
- Verify PostgreSQL is running (if using PostgreSQL)
- Check network connectivity

### Auth0 Issues

- Verify Auth0 credentials in `.env` files
- Check callback URLs in Auth0 dashboard
- Verify token audience and issuer

### Migration Issues

- Check migration status: `bun run db:status`
- Review migration files for errors
- Ensure database is accessible

## Next Steps

- See [Quick Start Guide](quick-start.md) for more details
- Review [Development Guide](../development/development.md) for development workflow
- Check [Architecture Documentation](../architecture/overview.md) for system design
