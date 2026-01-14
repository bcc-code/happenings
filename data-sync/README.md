# @bcc-events/data-sync

Client-server data synchronization engine with offline support, real-time updates, and fine-grained permissions.

## Features

- **Real-time synchronization** via Socket.io events
- **Offline support** with IndexedDB storage
- **Fine-grained permissions** (Microsoft-style: users/groups -> collections/items)
- **Content expiration** for automatic cleanup
- **Retention priority** system for managing storage space
- **Incremental sync** on reconnection (only changes since last online)
- **Deletion tracking** for proper sync of deleted items

## Usage

### Client Side

```typescript
import { createSyncClient } from '@bcc-events/data-sync/client';

const syncClient = createSyncClient({
  apiUrl: 'https://api.example.com',
  socketUrl: 'https://api.example.com',
  authToken: 'your-auth-token',
});

// Subscribe to a collection
const unsubscribe = syncClient.subscribe('events', {
  onUpdate: (documents) => {
    console.log('Documents updated:', documents);
  },
  onDelete: (ids) => {
    console.log('Documents deleted:', ids);
  },
});
```

### Server Side

```typescript
import { createSyncServer } from '@bcc-events/data-sync/server';

// Integrate with Elysia routes
app.use(syncServer.routes());
```

## Architecture

- **Client**: Handles local storage, sync logic, and Socket.io connection
- **Server**: Provides REST API for data fetching and Socket.io for events
- **Permissions**: Fine-grained access control at collection and item level
- **Storage**: IndexedDB for offline persistence with automatic cleanup
