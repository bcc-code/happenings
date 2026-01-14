# Multi-Tenancy Architecture - Requirements & Planning

## Overview

The multi-tenancy architecture ensures that each church operates as an independent tenant with complete data isolation while sharing the user database and supporting cross-tenant event access.

## Status: Planning Phase

**Last Updated:** [Date]
**Status:** Requirements gathering

---

## Core Requirements

### Tenant Isolation

- [ ] **Data Isolation**
  - All tenant-scoped tables include `tenant_id`
  - Row-level security policies
  - API-level tenant context validation
  - Database-level constraints

- [ ] **Configuration Isolation**
  - Tenant-specific settings
  - Custom branding (logos, colors)
  - Payment provider configurations
  - Email templates
  - Feature flags per tenant

- [ ] **Resource Isolation**
  - File storage per tenant
  - Resource quotas
  - Isolated admin access

### User Model

- [ ] **Central User Database**
  - Single user table (not tenant-scoped)
  - Auth0 integration for authentication
  - User profile management

- [ ] **User Affiliations**
  - Many-to-many relationship: users ↔ tenants
  - Primary affiliation (home church)
  - Role per affiliation
  - Affiliation status (active, inactive)

- [ ] **Cross-Tenant Access**
  - Users can view/register for global events
  - Access rules for global events
  - Maintain user context across tenants

### Global Events

- [ ] **Event Visibility**
  - Events marked as "global" are visible to all users
  - Access rules (geographic, affiliation-based, etc.)
  - Registration rules for global events

- [ ] **Data Access**
  - Event data accessible across tenants
  - Registration data remains tenant-scoped
  - Communication scoped to event context

## Database Schema (Planned)

```sql
-- Tenants table
tenants (
  id, name, slug, domain,
  logo_url, primary_color, secondary_color,
  timezone, locale, currency,
  created_at, updated_at, is_active
)

-- Users table (central, not tenant-scoped)
users (
  id, auth0_id, email, first_name,
  last_name, phone, avatar_url,
  timezone, locale, created_at, updated_at
)

-- User affiliations (many-to-many)
user_affiliations (
  id, user_id, tenant_id, role,
  is_primary, status, joined_at,
  last_active_at
)

-- Events (tenant-scoped, but can be global)
events (
  id, tenant_id, title, description,
  start_date, end_date, venue,
  is_global, global_access_rules,
  created_at, updated_at
)

-- Registrations (tenant-scoped)
registrations (
  id, user_id, event_id, tenant_id,
  status, registered_at, ...
)
```

## Tenant Context Resolution

### API Request Flow

1. Extract user from Auth0 token
2. Determine tenant context:
   - From URL subdomain/domain
   - From `X-Tenant-ID` header
   - From user's primary affiliation (default)
3. Validate user has access to tenant
4. Apply tenant context to all queries

### Tenant Identification

**Options:**
- Subdomain: `church1.bccevents.com`
- Path: `bccevents.com/church1/...`
- Header: `X-Tenant-ID: church1`
- Domain: `church1.com` (custom domains)

**Recommended:** Subdomain with header fallback

## Row-Level Security

### Database Policies (PostgreSQL)

```sql
-- Example: Events table policy
CREATE POLICY tenant_isolation ON events
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Example: Global events access
CREATE POLICY global_events_access ON events
  FOR SELECT
  USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
    OR (is_global = true AND check_global_access_rules(...))
  );
```

## API Design

### Tenant Context Middleware

```typescript
// Extract tenant from request
const tenantId = extractTenantId(req);
const userId = extractUserId(req);

// Validate user has access
await validateUserTenantAccess(userId, tenantId);

// Set tenant context
req.tenantId = tenantId;
req.userId = userId;
```

### Query Helpers

```typescript
// All queries automatically scoped to tenant
const events = await db.events.findMany({
  where: {
    tenantId: req.tenantId,
    // ... other filters
  }
});
```

## User Affiliation Management

### Affiliation Roles

- **Super Admin**: Full access to tenant
- **Admin**: Manage events and users
- **Event Manager**: Manage specific events
- **User**: Standard user access

### Affiliation Workflow

1. User requests affiliation (or admin invites)
2. Admin approves/denies
3. User receives role assignment
4. User can switch between affiliations

## Global Events Access Rules

### Rule Types

- **Geographic**: Country/region restrictions
- **Affiliation-based**: Specific church affiliations required
- **Role-based**: User role requirements
- **Open**: No restrictions (all users)

### Access Rule Schema

```typescript
interface GlobalAccessRule {
  type: 'geographic' | 'affiliation' | 'role' | 'open';
  value?: string | string[]; // Country codes, tenant IDs, roles
  operator?: 'include' | 'exclude';
}
```

## Configuration Management

### Tenant Settings

```typescript
interface TenantSettings {
  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };
  features: {
    [key: string]: boolean;
  };
  limits: {
    maxEvents: number;
    maxUsers: number;
    storageQuota: number;
  };
  payment: {
    defaultProvider: string;
    providers: PaymentProviderConfig[];
  };
}
```

## Migration Strategy

### Tenant Data Migration

- [ ] Export tenant data
- [ ] Import to new system
- [ ] Map user affiliations
- [ ] Verify data integrity

### User Migration

- [ ] Migrate users from existing system
- [ ] Create Auth0 accounts
- [ ] Map affiliations
- [ ] Send migration notifications

## Security Considerations

- [ ] Prevent tenant data leakage
- [ ] Validate tenant context on all operations
- [ ] Audit logging with tenant context
- [ ] Rate limiting per tenant
- [ ] Resource quotas per tenant
- [ ] Tenant isolation testing

## Scalability

- [ ] Database connection pooling
- [ ] Tenant-aware caching
- [ ] Horizontal scaling support
- [ ] Tenant data sharding (future)

## Open Questions

- [ ] How to handle tenant deletion?
- [ ] Should there be a super-admin tenant?
- [ ] How to handle tenant data export/backup?
- [ ] Should tenants have custom domains?
- [ ] How to handle tenant billing/subscriptions?
- [ ] Should there be tenant-level feature flags?
- [ ] How to handle tenant-to-tenant data sharing?

## Notes

_Add implementation notes, decisions, and updates here as development progresses._
