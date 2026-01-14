# Elysia Framework Migration

## Overview

The API has been migrated to **Elysia**, a modern, ergonomic web framework optimized for Bun.

## Why Elysia?

- **Actively Maintained**: Regular updates and active development
- **High Performance**: Designed to leverage Bun's capabilities
- **Type Safety**: Extensive TypeScript support with unified type system
- **Developer Experience**: Ergonomic API with excellent DX
- **Built-in Features**: Validation, documentation generation, and more
- **Bun Native**: Optimized specifically for Bun runtime


### Middleware
- Uses Elysia's `onBeforeHandle` hooks
- Context-based request/response handling
- Built-in CORS via `@elysiajs/cors`

### Routes
- Elysia's fluent API
- Sub-routers via `group()` method
- Type-safe context with `store`

## Installation

```bash
bun install
```

## Usage

### Basic Route
```typescript
import { Elysia } from 'elysia';

const app = new Elysia()
  .get('/', () => 'Hello Elysia')
  .listen(3000);
```

### Middleware
```typescript
app.onBeforeHandle(async ({ request, store }) => {
  // Before request
});
```

### Context Store
```typescript
// Set
store.user = userData;

// Get
const user = store.user;
```

### Sub-routers
```typescript
const adminRouter = new Elysia()
  .get('/events', listEvents);

app.group('/api/admin', adminRouter);
```

## Benefits

1. **Active Maintenance**: Regularly updated and maintained
2. **Better Performance**: Optimized for Bun's runtime
3. **Type Safety**: Full TypeScript support with unified types
4. **Ergonomic API**: Clean, intuitive syntax
5. **Rich Ecosystem**: Growing plugin ecosystem

## Migration Notes

- Routes use Elysia's context (`{ store, request }`) instead of raw Request
- Middleware uses `onBeforeHandle` hooks
- Response helpers return plain objects (Elysia handles serialization)
- Context variables stored in `store` object
- Sub-routers use `group()` instead of `route()`

## Resources

- [Elysia Documentation](https://elysiajs.com/)
- [Elysia GitHub](https://github.com/elysiajs/elysia)
