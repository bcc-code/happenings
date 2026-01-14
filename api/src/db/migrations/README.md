# Database Migrations

This directory contains database migration scripts and documentation.

## Migration Workflow

1. **Update Prisma Schema**: Edit `prisma/schema.prisma`
2. **Create Migration**: Run `npm run migrate:create -- --name migration_name`
3. **Review Migration**: Check generated SQL in `prisma/migrations/`
4. **Test Migration**: Run `npm run migrate` in development
5. **Deploy Migration**: Run `npm run migrate:deploy` in production

## Migration Best Practices

- Always test migrations in development first
- Review generated SQL before applying
- Create backups before running migrations in production
- Use descriptive migration names
- Keep migrations small and focused
- Never edit existing migrations (create new ones instead)

## Migration Naming Convention

Use descriptive names:
- `add_user_affiliations_table`
- `add_global_events_support`
- `add_payment_provider_config`

## Rollback Strategy

Prisma doesn't support automatic rollbacks. To rollback:
1. Create a new migration that reverses the changes
2. Or manually restore from backup

## Multi-Tenancy Considerations

- All tenant-scoped tables must include `tenant_id`
- Indexes should include `tenant_id` for performance
- Foreign keys should respect tenant boundaries
- Row-level security policies should be added via migrations
