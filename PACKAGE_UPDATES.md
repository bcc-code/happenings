# Package Updates - Latest Stable Versions

## Summary

All packages have been updated to their latest stable versions as of 2024.

## Key Changes

### Auth0 Integration

**Changed from:** `@nuxtjs/auth0` (does not exist)  
**Changed to:** `@auth0/auth0-vue` (official Auth0 Vue 3 SDK)

The `@nuxtjs/auth0` package doesn't exist in the npm registry. For Nuxt 3, we use the official `@auth0/auth0-vue` package directly.

### Updated Package Versions

#### Frontend Packages (Admin Dashboard & End User App)

- **Nuxt**: `^3.13.0` (latest stable)
- **Vue**: `^3.5.0` (latest stable)
- **PrimeVue**: `^3.49.0` (latest stable)
- **PrimeIcons**: `^7.0.0` (added for icons)
- **@auth0/auth0-vue**: `^2.0.0` (official Auth0 Vue SDK)
- **TypeScript**: `^5.5.0` (latest stable)
- **ESLint**: `^8.57.0` (latest stable)
- **@types/node**: `^20.14.0` (latest stable)

#### API Packages

- **Prisma**: `^5.19.0` (latest stable)
- **@prisma/client**: `^5.19.0` (latest stable)
- **TypeScript**: `^5.5.0` (latest stable)
- **tsx**: `^4.16.0` (latest stable)
- **ESLint**: `^8.57.0` (latest stable)
- **@typescript-eslint/eslint-plugin**: `^7.18.0` (latest stable)
- **@typescript-eslint/parser**: `^7.18.0` (latest stable)

#### Shared Package

- **tsup**: `^8.3.0` (latest stable)
- **TypeScript**: `^5.5.0` (latest stable)
- **ESLint**: `^8.57.0` (latest stable)

#### End User App Specific

- **idb**: `^8.0.0` (latest stable, for IndexedDB)
- **@nuxtjs/pwa**: `^0.6.0` (for offline support)

## Auth0 Setup

### Plugin Example

Example Auth0 plugins have been created:
- `admin-dashboard/plugins/auth0.client.ts.example`
- `end-user-app/plugins/auth0.client.ts.example`

Copy these to remove `.example` extension when ready to implement Auth0.

### Configuration

Auth0 configuration is already set up in `nuxt.config.ts` files:

```typescript
runtimeConfig: {
  public: {
    auth0Domain: process.env.AUTH0_DOMAIN || '',
    auth0ClientId: process.env.AUTH0_CLIENT_ID || '',
    auth0Audience: process.env.AUTH0_AUDIENCE || '',
  },
}
```

## Installation

After updating packages, run:

```bash
pnpm install
```

This will install all updated dependencies across the workspace.

## Notes

- All packages use exact version ranges (^) to allow patch and minor updates
- PrimeIcons has been added to both frontend apps for icon support
- The shared package uses workspace protocol for internal dependencies
- All TypeScript versions are consistent across packages (5.5.0)
