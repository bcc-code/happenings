# Integration Examples

## Full Nuxt 3 Integration

### Plugin

```typescript
// plugins/data-sync.client.ts
import { useSync } from '@bcc-events/data-sync/composables';
import { useAuth0 } from '@auth0/auth0-vue';

export default defineNuxtPlugin(async () => {
  const { getAccessTokenSilently } = useAuth0();
  const config = useRuntimeConfig();

  const sync = useSync({
    apiUrl: config.public.apiUrl,
    socketUrl: config.public.apiUrl,
    authToken: await getAccessTokenSilently(),
  });

  await sync.init();

  return {
    provide: {
      sync,
    },
  };
});
```

### Component Usage

```vue
<script setup lang="ts">
const { $sync } = useNuxtApp();
const { documents, isLoading } = useSyncCollection(
  $sync.client,
  'events'
);

onMounted(() => {
  start();
});
</script>
```

## Full API Integration

### Server Setup

```typescript
// api/src/index.ts
import { Elysia } from 'elysia';
import { Server } from 'socket.io';
import { createServer } from 'http';
import {
  SyncService,
  SocketHandler,
  createSyncRoutes,
} from '@bcc-events/data-sync/server';

const httpServer = createServer();
const io = new Server(httpServer);

const socketHandler = new SocketHandler(io, {
  verifyToken: async (token) => {
    const user = await verifyAuth0Token(token);
    return user ? { userId: user.sub } : null;
  },
});

const syncService = new SyncService({
  async getDocuments(collection, since, limit, offset) {
    return await db.query.documents.findMany({
      where: and(
        eq(documents.collection, collection),
        since ? gte(documents.updatedAt, since) : undefined
      ),
      limit,
      offset,
    });
  },
  // ... other methods
});

const app = new Elysia();
app.use(createSyncRoutes({ syncService, requireAuth }));

httpServer.listen(3000);
```

### Route Handlers

```typescript
app.post('/api/events', async ({ body, store }) => {
  const document = await createEvent(body);
  socketHandler.emitDocumentCreated(document);
  return document;
});

app.put('/api/events/:id', async ({ params, body }) => {
  const document = await updateEvent(params.id, body);
  socketHandler.emitDocumentUpdated(document);
  return document;
});

app.delete('/api/events/:id', async ({ params, store }) => {
  await deleteEvent(params.id);
  await createDeletionRecord('events', params.id, store.userId);
  socketHandler.emitDocumentDeleted('events', params.id, store.userId);
  return { success: true };
});
```
