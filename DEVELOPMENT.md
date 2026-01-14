# Development Guide

## Project Setup

### Prerequisites

- Bun >= 1.0.0 (install: `curl -fsSL https://bun.sh/install | bash`)
- pnpm >= 8.0.0
- PostgreSQL (for API and caching)

### Initial Setup

1. Clone the repository
2. Install pnpm (if not already installed):
   ```bash
   npm install -g pnpm
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Set up environment variables:
   - Copy `.env.example` files in each directory
   - Fill in required values

5. Set up database:
   ```bash
   cd api
   bunx prisma migrate dev
   ```

## Development Workflow

### Running Development Servers

```bash
# Run all services
pnpm dev

# Or run individually:
pnpm dev:api      # API only
pnpm dev:admin    # Admin Dashboard only
pnpm dev:app      # End User App only

# Or from individual directories:
cd api && pnpm dev
cd admin-dashboard && pnpm dev
cd end-user-app && pnpm dev
```

### Database Migrations

```bash
# Create a new migration
pnpm migrate:create -- --name migration_name

# Run migrations in development
pnpm migrate

# Deploy migrations in production
pnpm migrate:deploy

# Check migration status (from api directory)
cd api && pnpm migrate:status
```

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting (if configured)
- Write meaningful commit messages

## Project Structure

```
Happenings/
├── api/                    # Backend API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express/Fastify middleware
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   └── utils/         # Utilities
│   └── prisma/            # Database schema and migrations
│
├── admin-dashboard/        # Admin Vue/Nuxt app
│   ├── components/         # Vue components
│   ├── pages/             # Nuxt pages
│   ├── composables/       # Vue composables
│   └── stores/            # Pinia stores
│
├── end-user-app/          # End user Vue/Nuxt app
│   ├── components/        # Vue components
│   ├── pages/             # Nuxt pages
│   ├── composables/       # Vue composables
│   ├── stores/            # Pinia stores
│   └── workers/           # Service workers
│
├── shared/                # Shared package
│   ├── src/
│   │   ├── types/         # Shared TypeScript types
│   │   ├── utils/         # Shared utility functions
│   │   └── composables/   # Shared Vue composables
│   └── package.json
│
└── requirements/          # Requirements and planning docs
    ├── PROGRAM.md
    ├── CATERING.md
    ├── RESOURCES.md
    ├── FINANCE.md
    ├── COMMUNICATION.md
    ├── PAYMENT_PLUGINS.md
    ├── MULTI_TENANCY.md
    ├── OFFLINE_SUPPORT.md
    └── AUTH0_INTEGRATION.md
```

## Adding New Features

1. **Update Requirements**: Add requirements to the appropriate file in `requirements/`
2. **Plan Database Changes**: Update Prisma schema if needed
3. **Create Migration**: Generate database migration
4. **Add Shared Types/Utils**: If needed, add to `shared/` package
5. **Implement API**: Add API endpoints
6. **Implement Frontend**: Add UI components
7. **Test**: Write and run tests
8. **Document**: Update documentation

## Shared Package

The `shared/` package contains common code used across all packages:

- **Types**: TypeScript types and interfaces (`shared/src/types/`)
- **Utils**: Utility functions (`shared/src/utils/`)
- **Composables**: Vue 3 composables for frontend (`shared/src/composables/`)

### Using Shared Package

```typescript
// In API
import { User, Event, formatCurrency } from '@bcc-events/shared';

// In Frontend
import { User, Event, formatCurrency, useApi } from '@bcc-events/shared';
```

### Building Shared Package

```bash
# Build shared package
cd shared && pnpm build

# Or from root
pnpm --filter @bcc-events/shared build
```

## Testing

### API Tests

```bash
pnpm --filter @bcc-events/api test
# Or
cd api && pnpm test
```

### Frontend Tests

```bash
pnpm --filter @bcc-events/admin-dashboard test
pnpm --filter @bcc-events/end-user-app test

# Or
cd admin-dashboard && pnpm test
cd end-user-app && pnpm test
```

## Deployment

### Environment Variables

Ensure all required environment variables are set in production:

- Database connection strings
- Auth0 credentials
- API URLs
- Storage configuration
- Email service configuration

### Database Migrations

Always run migrations before deploying:

```bash
cd api
npm run migrate:deploy
```

### Build

```bash
# Build all projects
pnpm build

# Or individually:
pnpm build:api
pnpm build:admin
pnpm build:app

# Or from individual directories:
cd api && pnpm build
cd admin-dashboard && pnpm build
cd end-user-app && pnpm build
```

## Troubleshooting

### Database Connection Issues

- Check DATABASE_URL environment variable
- Verify PostgreSQL is running
- Check network connectivity

### Auth0 Issues

- Verify Auth0 credentials
- Check callback URLs in Auth0 dashboard
- Verify token audience and issuer

### Migration Issues

- Check migration status: `npm run migrate:status`
- Review migration files for errors
- Ensure database is accessible

## Contributing

1. Create a feature branch
2. Make changes following coding standards
3. Update requirements/docs as needed
4. Test thoroughly
5. Submit pull request

## Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [PrimeVue Documentation](https://primevue.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth0 Documentation](https://auth0.com/docs)
