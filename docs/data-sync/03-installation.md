# Installation

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- TypeScript >= 5.0.0

## Package Installation

### For Client-Side (Browser)

```bash
pnpm add @bcc-events/data-sync
```

This installs:
- `socket.io-client` - For real-time updates
- `idb` - For IndexedDB operations

### For Server-Side (Node.js/Bun)

```bash
pnpm add @bcc-events/data-sync socket.io
```

**Note**: `socket.io` is a peer dependency for server-side usage.

## Workspace Setup (Monorepo)

If using in a pnpm workspace:

```yaml
# pnpm-workspace.yaml
packages:
  - 'data-sync'
  - 'admin-dashboard'
  - 'end-user-app'
  - 'api'
```

Then in your packages:

```json
{
  "dependencies": {
    "@bcc-events/data-sync": "workspace:*"
  }
}
```

## TypeScript Configuration

The package includes TypeScript definitions. Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 10.3+)
- Opera: Full support

**Note**: IndexedDB is required. All modern browsers support it.

## Build Configuration

### Vite

No special configuration needed. The package is ESM/CJS compatible.

### Webpack

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    fallback: {
      // Socket.io client works in browser
    },
  },
};
```

### Nuxt 3

The package works out of the box with Nuxt 3. Use in plugins:

```typescript
// plugins/data-sync.client.ts
export default defineNuxtPlugin(async () => {
  // Your sync setup
});
```

## Verification

Test your installation:

```typescript
import { createSyncClient } from '@bcc-events/data-sync/client';

// Should not throw
const client = createSyncClient({
  apiUrl: 'http://localhost:3000',
  socketUrl: 'http://localhost:3000',
  authToken: 'test',
});

console.log('Installation successful!');
```

## Troubleshooting

### Module Not Found

If you see "Module not found" errors:

1. Ensure `node_modules` is installed: `pnpm install`
2. Check package is in `package.json`
3. Restart your dev server

### Type Errors

If TypeScript can't find types:

1. Ensure `@bcc-events/data-sync` is in `dependencies` (not `devDependencies`)
2. Restart TypeScript server
3. Check `tsconfig.json` includes the package

### Socket.io Issues

If Socket.io connection fails:

1. Ensure `socket.io` is installed on server
2. Check CORS configuration
3. Verify authentication token is valid

## Next Steps

- [Quick Start Guide](./02-quick-start.md)
- [Client Setup](../INTEGRATION.md#client-side-integration-nuxt-3)
- [Server Setup](../INTEGRATION.md#server-side-integration-api)
