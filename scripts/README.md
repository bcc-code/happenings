# Setup Scripts

## setup.ts

Automated setup script for new developers. This script handles the initial setup of the development environment.

### Usage

```bash
# Basic setup (creates .env files, sets up database)
pnpm bootstrap

# Setup and start all services immediately
pnpm bootstrap:start
```

### What it does

1. **Checks prerequisites**
   - Verifies Bun is installed
   - Verifies pnpm is installed

2. **Checks dependencies**
   - Verifies `node_modules` exists
   - Runs `pnpm install` if needed

3. **Sets up environment variables**
   - Creates `api/.env` with SQLite configuration
   - Creates `admin-dashboard/.env` with API URL
   - Creates `end-user-app/.env` with API URL

4. **Sets up database**
   - Creates SQLite database file (`api/local.db`)
   - Applies schema using `db:push`

5. **Optionally starts services**
   - Starts API server (port 9000)
   - Starts End User App (port 9001)
   - Starts Admin Dashboard (port 9002)

### Environment Variables

The script creates `.env` files with sensible defaults for local development:

**api/.env:**
- `DB_TYPE=sqlite` - Uses SQLite for local dev
- `DATABASE_URL=./local.db` - SQLite database file
- `PORT=9000` - API server port

**admin-dashboard/.env & end-user-app/.env:**
- `API_URL=http://localhost:9000` - API endpoint

Auth0 configuration is optional and can be added manually to the `.env` files.

### Notes

- The script uses SQLite by default for local development (no PostgreSQL setup required)
- All `.env` files are created with `.gitignore` patterns to avoid committing secrets
- The script is idempotent - safe to run multiple times
- Existing `.env` files are not overwritten
