# Basic Usage Examples

## Client-Side

### Simple Subscription

```typescript
import { createSyncClient } from '@bcc-events/data-sync/client';

const client = createSyncClient({
  apiUrl: 'https://api.example.com',
  socketUrl: 'https://api.example.com',
  authToken: 'your-token',
});

await client.init();

client.subscribe('events', {
  onUpdate: (documents) => {
    console.log('Events updated:', documents);
  },
});
```

### Getting Documents

```typescript
// Get all events
const events = await client.getDocuments('events');

// Get specific event
const event = await client.getDocument('events', 'event-123');
```

### Manual Sync

```typescript
// Sync a collection
await client.syncCollection('events');

// Sync all collections
await client.syncAll();
```

## Server-Side

### Basic Setup

```typescript
import { SyncService, SocketHandler, createSyncRoutes } from '@bcc-events/data-sync/server';
import { Server } from 'socket.io';

const io = new Server(httpServer);
const socketHandler = new SocketHandler(io);

const syncService = new SyncService({
  async getDocuments(collection, since) {
    // Fetch from database
    return documents;
  },
  // ... other methods
});

app.use(createSyncRoutes({ syncService, requireAuth }));
```

### Emitting Events

```typescript
// Document created
socketHandler.emitDocumentCreated(document);

// Document updated
socketHandler.emitDocumentUpdated(document);

// Document deleted
socketHandler.emitDocumentDeleted('events', 'event-123', userId);
```

## Vue Integration

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
  <div v-for="event in documents" :key="event.id">
    {{ event.data.title }}
  </div>
</template>
```
