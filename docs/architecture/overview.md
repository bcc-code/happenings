# Architecture Documentation

## System Overview

The BCC Events Registration App is a multi-tenant SaaS application designed to serve churches worldwide. The architecture supports:

- Independent tenant isolation (each church is a tenant)
- Shared user database with Auth0 authentication
- Cross-tenant event access (global events)
- Plugin-based payment provider integration
- Offline-first end user experience

## Multi-Tenancy Strategy

### Tenant Isolation

Each church operates as a completely independent tenant with:
- Isolated data storage (tenant_id on all relevant tables)
- Custom branding and configuration
- Independent payment provider integrations
- Separate event management

### User Model

Users are stored in a central database and can have:
- Link to BCC Core API SDK Person entity (via personId)
- Multiple church affiliations (many-to-many relationship)
- Primary affiliation (home church)
- Access to global events from other churches
- Role-based permissions per tenant
- Family relationships (via BCC Core API SDK Relations)
- Family group memberships

### Global Events

Events can be marked as "global" which allows:
- Users from other churches to view and register
- Configurable access rules (geographic, affiliation-based, etc.)
- Cross-church collaboration

## Component Architecture

### API Server

**Responsibilities:**
- Business logic and data validation
- Multi-tenant data isolation
- Auth0 token validation and user management
- Payment plugin orchestration
- Database migrations
- Real-time updates via WebSocket/SSE

**Technology Stack:**
- Node.js with TypeScript (recommended)
- Express/Fastify for HTTP server
- PostgreSQL for data storage
- Prisma/TypeORM for ORM and migrations
- WebSocket support for live updates

### Admin Dashboard

**Responsibilities:**
- Event creation and management
- User management within tenant
- Payment provider configuration
- Settings and branding
- Reports and analytics

**Technology Stack:**
- Nuxt 3 with Vue 3
- PrimeVue components
- @bcc-code/design-tokens
- Service Workers for offline capability
- WebSocket client for live updates

### End User App

**Responsibilities:**
- Event browsing and registration
- Profile management
- Offline viewing of event details
- Payment processing
- Communication and notifications

**Technology Stack:**
- Nuxt 3 with Vue 3
- PrimeVue components
- @bcc-code/design-tokens
- Service Workers + IndexedDB for offline support
- Background sync for registrations
- WebSocket client for live updates

## Database Schema Overview

### Core Tables

- `tenants` - Church/tenant information
- `users` - Central user database (linked to BCC Core API SDK Person via personId)
- `user_affiliations` - Many-to-many user-church relationships
- `family_groups` - Family units
- `family_group_members` - Family relationships
- `family_registrations` - Grouped family event registrations
- `events` - Event information (tenant-scoped)
- `registrations` - User event registrations (can be part of family registration)
- `payment_providers` - Tenant payment provider configurations
- `payment_plugins` - Available payment provider plugins

### Module-Specific Tables

See individual requirements documents for:
- Program module tables
- Catering module tables
- Resources module tables
- Finance module tables
- Communication module tables

## Authentication & Authorization

### Auth0 Integration

- All authentication handled by Auth0
- User profile stored in central database
- JWT tokens validated on API
- Tenant context extracted from user affiliations

### Authorization Model

- Role-based access control (RBAC) per tenant
- Roles: Super Admin, Admin, Event Manager, User
- Permissions scoped to tenant context
- Global event access rules

## Payment Provider Plugin System

### Plugin Interface

Payment providers are implemented as plugins that:
- Implement a standard interface
- Handle payment processing
- Support webhook callbacks
- Provide configuration UI
- Support multiple currencies

### Plugin Registration

- Plugins registered in database
- Tenants configure which plugins to use
- Multiple plugins can be active per tenant
- Plugin-specific settings stored securely

## Offline Support Strategy

### End User App

**Offline Capabilities:**
- View cached event details
- View cached program schedules
- View cached volunteer shifts
- View registration history

**Sync Strategy:**
- Background sync for registrations
- Periodic sync when online
- Conflict resolution for concurrent edits
- Optimistic UI updates

**Storage:**
- IndexedDB for structured data
- Cache API for static assets
- Service Worker for network interception

## Live Updates

### Real-Time Communication

- WebSocket connections for live updates
- Event-driven updates (new registrations, program changes)
- Tenant-scoped channels
- Graceful degradation to polling

## Security Considerations

- Tenant data isolation at database level
- Row-level security policies
- API rate limiting per tenant
- Secure payment provider credential storage
- HTTPS everywhere
- CORS configuration
- Input validation and sanitization

## Scalability Considerations

- Database connection pooling
- Caching strategy (PostgreSQL-based cache table)
- CDN for static assets
- Horizontal scaling capability
- Database read replicas for reporting

## Deployment Strategy

- Containerized applications (Docker)
- Environment-based configuration
- Database migration strategy
- Zero-downtime deployments
- Health check endpoints
