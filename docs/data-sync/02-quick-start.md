# Quick Start

Get up and running with `@bcc-events/data-sync` in 5 minutes.

## Installation

```bash
pnpm add @bcc-events/data-sync
```

## Client-Side Setup

### 1. Create Sync Client

```typescript
import { createSyncClient } from '@bcc-events/data-sync/client';

const syncClient = createSyncClient({
  apiUrl: 'https://api.example.com',
  socketUrl: 'https://api.example.com',
  authToken: 'your-auth-token',
});

await syncClient.init();
```

### 2. Subscribe to a Collection

```typescript
const unsubscribe = syncClient.subscribe('events', {
  onUpdate: (documents) => {
    console.log('Events updated:', documents);
  },
  onDelete: (ids) => {
    console.log('Events deleted:', ids);
  },
});
```

### 3. Get Documents

```typescript
// Get all documents in a collection
const events = await syncClient.getDocuments('events');

// Get a specific document
const event = await syncClient.getDocument('events', 'event-123');
```

## Server-Side Setup

### 1. Install Socket.io

```bash
pnpm add socket.io
```

### 2. Set Up Socket.io Server

```typescript
import { Server } from 'socket.io';
import { createServer } from 'http';
import { SocketHandler } from '@bcc-events/data-sync/server';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*', credentials: true },
});

const socketHandler = new SocketHandler(io, {
  verifyToken: async (token) => {
    // Verify token and return userId
    return { userId: 'user-123' };
  },
});
```

### 3. Create Sync Service

```typescript
import { SyncService } from '@bcc-events/data-sync/server';

const syncService = new SyncService({
  async getDocuments(collection, since, limit, offset) {
    // Fetch from your database
    return documents;
  },
  async getDeletions(collection, since) {
    // Fetch deletion records
    return deletions;
  },
  async getUserPermissions(userId) {
    // Fetch user permissions
    return permissions;
  },
  async getUserGroups(userId) {
    // Fetch user groups
    return groups;
  },
});
```

### 4. Add Routes

```typescript
import { createSyncRoutes } from '@bcc-events/data-sync/server';

app.use(createSyncRoutes({
  syncService,
  requireAuth: (app) => app.use(authMiddleware),
}));
```

### 5. Emit Events

```typescript
// When document is created/updated
socketHandler.emitDocumentUpdated(document);

// When document is deleted
socketHandler.emitDocumentDeleted('events', 'event-123', userId);
```

## Vue/Nuxt Integration

### Using Composables

```vue
<script setup lang="ts">
import { useSync, useSyncCollection } from '@bcc-events/data-sync/composables';

const sync = useSync({
  apiUrl: 'https://api.example.com',
  socketUrl: 'https://api.example.com',
  authToken: 'token',
});

await sync.init();

const { documents, isLoading } = useSyncCollection(
  sync.client,
  'events'
);

onMounted(() => {
  start();
});
</script>

<template>
  <div v-for="doc in documents" :key="doc.id">
    {{ doc.data }}
  </div>
</template>
```

## Next Steps

- [Full Integration Guide](../INTEGRATION.md)
- [Client API Reference](./08-client-api.md)
- [Server API Reference](./09-server-api.md)
