# Data Sync Integration Guide

This guide explains how to integrate the `@bcc-events/data-sync` package into your API and frontend applications.

## Server-Side Integration (API)

### 1. Install Dependencies

```bash
pnpm add socket.io @bcc-events/data-sync
```

### 2. Set Up Socket.io Server

In your Elysia API (`api/src/index.ts`):

```typescript
import { Server } from 'socket.io';
import { createServer } from 'http';
import { SocketHandler } from '@bcc-events/data-sync/server';

// Create HTTP server
const httpServer = createServer();

// Create Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
});

// Create socket handler
const socketHandler = new SocketHandler(io, {
  verifyToken: async (token) => {
    // Verify Auth0 token and return userId
    const user = await verifyAuth0Token(token);
    return user ? { userId: user.sub } : null;
  },
});
```

### 3. Set Up Sync Service

```typescript
import { SyncService } from '@bcc-events/data-sync/server';
import { db } from './db/client';
import { documents } from './db/schema';

const syncService = new SyncService({
  async getDocuments(collection, since, limit, offset) {
    // Fetch documents from your database
    // Convert to SyncDocument format
    const docs = await db.query.documents.findMany({
      where: and(
        eq(documents.collection, collection),
        since ? gte(documents.updatedAt, since) : undefined
      ),
      limit,
      offset,
    });
    
    return docs.map(convertToSyncDocument);
  },
  
  async getDeletions(collection, since) {
    // Fetch deletion records
    // You'll need to store these when documents are deleted
    return await getDeletionRecords(collection, since);
  },
  
  async getUserPermissions(userId) {
    // Fetch user permissions from database
    return await getUserPermissionsFromDB(userId);
  },
  
  async getUserGroups(userId) {
    // Fetch user's group memberships
    return await getUserGroupsFromDB(userId);
  },
});
```

### 4. Add Sync Routes

```typescript
import { createSyncRoutes } from '@bcc-events/data-sync/server';

app.use(createSyncRoutes({
  syncService,
  requireAuth: (app) => app.use(requireAuthMiddleware),
}));
```

### 5. Emit Events When Data Changes

When documents are created, updated, or deleted:

```typescript
// On document create/update
socketHandler.emitDocumentCreated(syncDocument);
// or
socketHandler.emitDocumentUpdated(syncDocument);

// On document delete
socketHandler.emitDocumentDeleted(collection, id, userId);
```

## Client-Side Integration (Nuxt 3)

### 1. Install Dependencies

```bash
pnpm add @bcc-events/data-sync
```

### 2. Create Sync Plugin

Create `plugins/data-sync.client.ts`:

```typescript
import { useSync } from '@bcc-events/data-sync/composables';
import { useAuth0 } from '@auth0/auth0-vue';

export default defineNuxtPlugin(async () => {
  const { getAccessTokenSilently } = useAuth0();
  
  const config = {
    apiUrl: useRuntimeConfig().public.apiUrl,
    socketUrl: useRuntimeConfig().public.apiUrl,
    authToken: await getAccessTokenSilently(),
  };
  
  const sync = useSync(config);
  await sync.init();
  
  return {
    provide: {
      sync,
    },
  };
});
```

### 3. Use in Components

```vue
<script setup lang="ts">
import { useSyncCollection } from '@bcc-events/data-sync/composables';

const { $sync } = useNuxtApp();
const { documents, isLoading, error, start, refresh } = useSyncCollection(
  computed(() => $sync.client.value),
  'events'
);

onMounted(() => {
  start();
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <div v-for="doc in documents" :key="doc.id">
      {{ doc.data }}
    </div>
  </div>
</template>
```

## Database Schema Requirements

You'll need to store:

1. **Permissions Table**: Store user/group permissions for collections/items
2. **Deletion Records**: Store deletion records when documents are deleted (for sync)

Example schema additions:

```typescript
// permissions table
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id'),
  groupId: uuid('group_id'),
  collection: varchar('collection').notNull(),
  itemId: varchar('item_id'),
  actions: json('actions').$type<PermissionAction[]>().notNull(),
  scope: varchar('scope').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// deletion_records table
export const deletionRecords = pgTable('deletion_records', {
  id: uuid('id').primaryKey(),
  collection: varchar('collection').notNull(),
  itemId: varchar('item_id').notNull(),
  deletedAt: timestamp('deleted_at').defaultNow(),
  deletedBy: uuid('deleted_by').notNull(),
  version: integer('version').notNull(),
});
```

## Best Practices

1. **Permissions**: Always check permissions before emitting events
2. **Deletion Records**: Create deletion records when documents are deleted
3. **Versioning**: Increment document version on each update
4. **Expiration**: Set appropriate expiration dates for temporary data
5. **Retention Priority**: Set retention priorities based on data importance
6. **Error Handling**: Always handle sync errors gracefully
7. **Offline Mode**: The client automatically handles offline mode with IndexedDB
