# SQLite for Local Development

The API supports both PostgreSQL (production) and SQLite (local development) databases. SQLite is perfect for local development as it requires no setup - just a file!

## Quick Start

### Using SQLite

1. Set environment variables:
```bash
export DB_TYPE=sqlite
export DATABASE_URL=./local.db
```

Or create a `.env` file:
```env
DB_TYPE=sqlite
DATABASE_URL=./local.db
```

2. Run migrations (or push schema):
```bash
# Push schema directly (recommended for local dev)
bun run db:push

# Or generate and run migrations
bun run db:generate
bun run db:migrate
```

3. Start the API:
```bash
bun run dev
```

### Using PostgreSQL

Simply set `DATABASE_URL` to your PostgreSQL connection string:
```bash
export DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

Or if `DATABASE_URL` starts with `postgres://` or `postgresql://`, PostgreSQL will be used automatically.

## Database Type Detection

The database type is determined by:
1. `DB_TYPE` environment variable (explicit)
2. `DATABASE_URL` prefix (if starts with `postgres://` or `postgresql://`, uses PostgreSQL)
3. Defaults to SQLite if neither condition is met

## SQLite Features

- **File-based**: Database stored in a single file (e.g., `./local.db`)
- **In-memory**: Use `:memory:` for a temporary database
- **No setup required**: No need to install or configure PostgreSQL locally
- **Fast**: Bun's native SQLite is very fast
- **Foreign keys**: Automatically enabled

## Schema Compatibility

The same Drizzle schema works for both PostgreSQL and SQLite. Drizzle automatically handles type differences:
- PostgreSQL `UUID` → SQLite `TEXT`
- PostgreSQL `JSONB` → SQLite `JSON`
- PostgreSQL `ENUM` → SQLite `TEXT` with constraints

## Migrations

### For SQLite

```bash
# Set SQLite mode
export DB_TYPE=sqlite
export DATABASE_URL=./local.db

# Generate migrations
bun run db:generate

# Apply migrations
bun run db:migrate

# Or push schema directly (faster for local dev)
bun run db:push
```

### For PostgreSQL

```bash
# Set PostgreSQL connection
export DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Generate migrations
bun run db:generate

# Apply migrations
bun run db:migrate
```

## Notes

- SQLite is **only recommended for local development**
- Production should always use PostgreSQL
- The same schema files work for both databases
- Migrations are database-specific (SQLite migrations won't work with PostgreSQL and vice versa)
- Use `db:push` for quick schema updates during development
- Use `db:generate` + `db:migrate` for production-ready migrations

## Troubleshooting

### "Database file is locked"
- Make sure no other process is using the database file
- Close any database viewers or other connections

### "Foreign key constraint failed"
- Ensure foreign keys are enabled (they are automatically enabled)
- Check that referenced records exist before inserting

### Migration errors
- Make sure `DB_TYPE` matches the database you're using
- For SQLite, ensure `better-sqlite3` is installed: `bun add -d better-sqlite3`
- Try using `db:push` instead of migrations for local development
