# Auth0 Integration - Requirements & Planning

## Overview

Auth0 provides centralized authentication and user management for the BCC Events Registration App. All users authenticate through Auth0, and user profiles are stored in the central database.

## Status: Planning Phase

**Last Updated:** [Date]
**Status:** Requirements gathering

---

## Core Requirements

### Authentication Flow

- [ ] **Login Methods**
  - Email/password
  - Social login (Google, Facebook, etc.)
  - Magic link (passwordless)
  - SMS OTP (optional)

- [ ] **User Registration**
  - Self-registration flow
  - Email verification
  - Profile completion
  - Initial affiliation assignment

### User Profile Management

- [ ] **Profile Data**
  - Stored in central database (not Auth0)
  - Synced with Auth0 user metadata
  - Profile updates reflected in Auth0

- [ ] **Profile Fields**
  - Basic: Name, email, phone, avatar
  - Preferences: Timezone, locale, notifications
  - Affiliations: Church memberships
  - Dietary: Preferences and allergens

### Authorization

- [ ] **Role-Based Access Control**
  - Roles per tenant affiliation
  - Permission system
  - API-level authorization

- [ ] **Token Management**
  - JWT token validation
  - Token refresh
  - Token revocation

## Auth0 Configuration

### Application Setup

- [ ] **Applications**
  - API application (backend)
  - Admin Dashboard SPA
  - End User App SPA

- [ ] **APIs**
  - BCC Events API
  - Scopes and permissions

### Authentication Settings

- [ ] **Password Policy**
  - Minimum length
  - Complexity requirements
  - Password reset flow

- [ ] **Session Management**
  - Session duration
  - Remember me functionality
  - Multi-factor authentication (optional)

## Integration Architecture

### Token Flow

```
1. User logs in via Auth0
2. Auth0 returns JWT token
3. Frontend sends token to API
4. API validates token with Auth0
5. API extracts user info from token
6. API queries database for user profile
7. API applies tenant context
```

### User Sync

```typescript
// On Auth0 login webhook
1. Receive Auth0 user_created/user_updated event
2. Create/update user in database
3. Sync user metadata
4. Handle email changes
```

## Database Schema (Planned)

```sql
-- Users table (central, synced with Auth0)
users (
  id, auth0_id, email, email_verified,
  first_name, last_name, phone,
  avatar_url, timezone, locale,
  created_at, updated_at, last_login_at
)

-- User metadata (extended profile)
user_metadata (
  user_id, metadata_key, metadata_value,
  updated_at
)

-- Auth0 session tracking
auth_sessions (
  id, user_id, auth0_session_id,
  ip_address, user_agent, created_at,
  expires_at, revoked_at
)
```

## API Endpoints (Planned)

### Authentication
- `POST /api/auth/login` - Initiate Auth0 login (redirect)
- `GET /api/auth/callback` - Handle Auth0 callback
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### User Profile
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/me/affiliations` - Get user affiliations

### Webhooks
- `POST /api/webhooks/auth0` - Handle Auth0 webhooks
  - `user_created`
  - `user_updated`
  - `user_deleted`
  - `user_login`

## Frontend Integration

### Auth0 SDK Setup

```typescript
// Nuxt plugin for Auth0
import { createAuth0 } from '@auth0/auth0-vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createAuth0, {
    domain: config.auth0.domain,
    clientId: config.auth0.clientId,
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  })
})
```

### Protected Routes

```typescript
// Middleware for protected routes
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth0()
  
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
```

## Token Validation

### API Middleware

```typescript
// Validate Auth0 JWT token
async function validateAuth0Token(token: string) {
  const jwks = await getJWKS()
  const decoded = jwt.verify(token, jwks, {
    audience: config.auth0.audience,
    issuer: `https://${config.auth0.domain}/`
  })
  
  return decoded
}
```

## User Profile Sync

### Sync Strategy

1. **On Login**: Fetch user from Auth0, sync to database
2. **On Webhook**: Update database when Auth0 user changes
3. **On Profile Update**: Update Auth0 metadata if needed

### Sync Fields

- Email (from Auth0)
- Email verified status
- Name (from Auth0 or database)
- Avatar (from Auth0 or database)
- Metadata (stored in database)

## Authorization Model

### Roles

- **Super Admin**: Full system access
- **Admin**: Full tenant access
- **Event Manager**: Event management access
- **User**: Standard user access

### Permissions

- Scoped to tenant context
- Stored in database
- Validated on API requests

## Security Considerations

- [ ] Token validation on all protected endpoints
- [ ] HTTPS only
- [ ] Secure token storage (httpOnly cookies or secure storage)
- [ ] CSRF protection
- [ ] Rate limiting on auth endpoints
- [ ] Audit logging of auth events

## Multi-Tenant Context

### Tenant Resolution

1. Extract user from Auth0 token
2. Query user affiliations
3. Determine tenant from:
   - Subdomain
   - Header
   - Primary affiliation
4. Validate user has access

## Error Handling

### Auth Errors

- Invalid token → 401 Unauthorized
- Expired token → 401 + refresh attempt
- Insufficient permissions → 403 Forbidden
- User not found → 404 Not Found

## Testing

- [ ] Auth0 mock for testing
- [ ] Token validation tests
- [ ] User sync tests
- [ ] Authorization tests
- [ ] Multi-tenant access tests

## Open Questions

- [ ] Should we support passwordless login?
- [ ] How to handle email changes in Auth0?
- [ ] Should there be admin user creation?
- [ ] How to handle user deletion?
- [ ] Should we support SSO?
- [ ] How to handle MFA?
- [ ] Should there be API key authentication for system integrations?

## Notes

_Add implementation notes, decisions, and updates here as development progresses._
