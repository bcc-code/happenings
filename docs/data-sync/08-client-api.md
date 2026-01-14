# Client API Reference

Complete reference for the client-side data sync API.

## SyncClient

Main synchronization client class.

### Constructor

```typescript
import { createSyncClient } from '@bcc-events/data-sync/client';

const syncClient = createSyncClient(config: SyncClientConfig);
```

### Methods

#### `init()`

Initialize the sync client. Must be called before use.

```typescript
await syncClient.init();
```

**Returns:** `Promise<void>`

**Throws:** Error if initialization fails

---

#### `subscribe(collection, options)`

Subscribe to a collection for real-time updates.

```typescript
const unsubscribe = syncClient.subscribe('events', {
  onUpdate: (documents) => {
    console.log('Updated:', documents);
  },
  onDelete: (ids) => {
    console.log('Deleted:', ids);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});

// Later, unsubscribe
unsubscribe();
```

**Parameters:**
- `collection: string` - Collection name
- `options: SubscriptionOptions` - Subscription callbacks

**Returns:** `() => void` - Unsubscribe function

---

#### `syncCollection(collection, since?)`

Sync a specific collection.

```typescript
// Full sync
await syncClient.syncCollection('events');

// Incremental sync
await syncClient.syncCollection('events', lastSyncDate);
```

**Parameters:**
- `collection: string` - Collection name
- `since?: Date` - Only fetch changes since this date

**Returns:** `Promise<void>`

**Throws:** Error if sync fails

---

#### `syncAll()`

Sync all subscribed collections.

```typescript
await syncClient.syncAll();
```

**Returns:** `Promise<void>`

---

#### `syncSince(since)`

Sync changes since a specific date for all collections.

```typescript
await syncClient.syncSince(new Date('2024-01-01'));
```

**Parameters:**
- `since: Date` - Date to sync from

**Returns:** `Promise<void>`

---

#### `getDocuments(collection)`

Get all documents from local storage.

```typescript
const documents = await syncClient.getDocuments('events');
```

**Parameters:**
- `collection: string` - Collection name

**Returns:** `Promise<SyncDocument[]>`

---

#### `getDocument(collection, id)`

Get a specific document from local storage.

```typescript
const event = await syncClient.getDocument('events', 'event-123');
```

**Parameters:**
- `collection: string` - Collection name
- `id: string` - Document ID

**Returns:** `Promise<SyncDocument | undefined>`

---

#### `getState()`

Get current sync state.

```typescript
const state = syncClient.getState();
// {
//   status: SyncStatus.IDLE,
//   lastSync: Date,
//   collections: ['events', 'registrations']
// }
```

**Returns:** `SyncState`

---

#### `getStorageStats()`

Get storage statistics.

```typescript
const stats = await syncClient.getStorageStats();
// {
//   totalSize: 1024000,
//   documentCount: 150,
//   collectionCount: 3,
//   oldestDocument: Date,
//   newestDocument: Date
// }
```

**Returns:** `Promise<StorageStats>`

---

#### `stopAutoSync()`

Stop automatic background syncing.

```typescript
syncClient.stopAutoSync();
```

---

#### `disconnect()`

Disconnect and cleanup.

```typescript
await syncClient.disconnect();
```

**Returns:** `Promise<void>`

---

## SyncStorage

Low-level storage interface (typically used internally).

### Methods

#### `init()`

Initialize IndexedDB storage.

```typescript
await storage.init();
```

---

#### `putDocument(document)`

Store a document.

```typescript
await storage.putDocument(document);
```

---

#### `getDocument(collection, id)`

Get a document.

```typescript
const doc = await storage.getDocument('events', 'event-123');
```

---

#### `getDocuments(collection)`

Get all documents in a collection.

```typescript
const docs = await storage.getDocuments('events');
```

---

#### `deleteDocument(collection, id, deletedBy, version)`

Delete a document (creates deletion record).

```typescript
await storage.deleteDocument('events', 'event-123', 'user-456', 5);
```

---

#### `getDeletions(collection, since?)`

Get deletion records.

```typescript
const deletions = await storage.getDeletions('events', since);
```

---

#### `cleanupExpired()`

Remove expired documents.

```typescript
const removed = await storage.cleanupExpired();
```

**Returns:** `Promise<number>` - Number of documents removed

---

#### `ensureStorageSpace()`

Ensure storage space by removing low-priority documents.

```typescript
await storage.ensureStorageSpace();
```

---

#### `getStats()`

Get storage statistics.

```typescript
const stats = await storage.getStats();
```

---

#### `clear()`

Clear all data.

```typescript
await storage.clear();
```

---

## Configuration

### SyncClientConfig

```typescript
interface SyncClientConfig {
  apiUrl: string;               // Required: API base URL
  socketUrl: string;            // Required: Socket.io server URL
  authToken: string;            // Required: Authentication token
  dbName?: string;              // Optional: IndexedDB name (default: 'data-sync')
  maxStorageSize?: number;      // Optional: Max storage bytes (default: 50MB)
  syncInterval?: number;         // Optional: Auto-sync interval ms (default: 30000)
  reconnectDelay?: number;      // Optional: Reconnect delay ms (default: 1000)
}
```

### SubscriptionOptions

```typescript
interface SubscriptionOptions {
  onUpdate?: (documents: SyncDocument[]) => void;
  onDelete?: (ids: string[]) => void;
  onError?: (error: Error) => void;
  filters?: Record<string, unknown>;  // Future feature
}
```

## Examples

### Basic Usage

```typescript
import { createSyncClient } from '@bcc-events/data-sync/client';

const client = createSyncClient({
  apiUrl: 'https://api.example.com',
  socketUrl: 'https://api.example.com',
  authToken: 'token',
});

await client.init();

// Subscribe
const unsubscribe = client.subscribe('events', {
  onUpdate: (docs) => console.log('Updated:', docs),
});

// Get documents
const events = await client.getDocuments('events');

// Sync
await client.syncCollection('events');
```

### Advanced Usage

```typescript
// Custom storage size
const client = createSyncClient({
  apiUrl: 'https://api.example.com',
  socketUrl: 'https://api.example.com',
  authToken: 'token',
  maxStorageSize: 100 * 1024 * 1024, // 100MB
  syncInterval: 60000, // 1 minute
});

// Monitor state
const state = client.getState();
console.log('Status:', state.status);
console.log('Last sync:', state.lastSync);

// Check storage
const stats = await client.getStorageStats();
if (stats.totalSize > 80 * 1024 * 1024) {
  console.warn('Storage nearly full');
}
```

## Error Handling

```typescript
try {
  await client.syncCollection('events');
} catch (error) {
  if (error.message.includes('Permission denied')) {
    // Handle permission error
  } else if (error.message.includes('Network')) {
    // Handle network error
  } else {
    // Handle other errors
  }
}
```

## Next Steps

- [Composables Reference](./11-composables.md)
- [Server API Reference](./09-server-api.md)
- [Types Reference](./10-types-reference.md)
