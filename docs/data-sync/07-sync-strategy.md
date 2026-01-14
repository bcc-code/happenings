# Sync Strategy

## Overview

The data sync system uses a multi-layered synchronization strategy combining HTTP requests for data fetching and Socket.io for real-time updates.

## Sync Modes

### 1. Full Sync

Used on initial connection or when starting fresh.

**When it happens:**
- First time subscribing to a collection
- After clearing local storage
- When `lastSync` is not available

**What it does:**
- Fetches all documents in the collection
- Stores complete state locally
- Sets `lastSync` timestamp

```typescript
// Full sync
await syncClient.syncCollection('events');
// Fetches all events from server
```

### 2. Incremental Sync

Used on reconnection or periodic sync.

**When it happens:**
- Reconnecting after being offline
- Periodic auto-sync (every 30s by default)
- Manual refresh

**What it does:**
- Fetches only changes since `lastSync`
- Includes deletion records
- Merges with existing data

```typescript
// Incremental sync
await syncClient.syncCollection('events', lastSyncDate);
// Fetches only changes since lastSyncDate
```

### 3. Real-time Sync

Used for immediate updates via Socket.io.

**When it happens:**
- Document created/updated/deleted on server
- Another client makes changes
- Server broadcasts events

**What it does:**
- Receives event immediately
- Updates IndexedDB
- Notifies subscribers
- No HTTP request needed

```typescript
// Real-time update (automatic)
socketHandler.emitDocumentUpdated(document);
// All subscribed clients receive update instantly
```

## Sync Flow

### Initial Connection

```
1. Client connects to Socket.io
2. Client subscribes to collections
3. For each collection:
   a. Check if lastSync exists
   b. If yes: Incremental sync (since lastSync)
   c. If no: Full sync (all documents)
4. Store documents in IndexedDB
5. Set lastSync timestamp
```

### Reconnection Flow

```
1. Client detects connection restored
2. Get lastSync timestamp from IndexedDB
3. For each subscribed collection:
   a. Incremental sync (since lastSync)
   b. Merge with existing documents
   c. Apply deletions
4. Update lastSync timestamp
```

### Real-time Update Flow

```
1. Server: Document updated
2. Server: Emit Socket.io event
3. Client: Receive event
4. Client: Update IndexedDB
5. Client: Notify subscribers
6. Client: Update UI (if subscribed)
```

## Conflict Resolution

### Last-Write-Wins

The system uses a version-based last-write-wins strategy:

1. Each document has a `version` number
2. Server increments version on each update
3. Client updates if server version > local version
4. Conflicts resolved by accepting server version

```typescript
// Conflict resolution
if (serverDocument.metadata.version > localDocument.metadata.version) {
  // Server version wins
  await storage.putDocument(serverDocument);
} else {
  // Local version is newer (shouldn't happen in normal flow)
  // Keep local version, but this indicates a problem
}
```

### Deletion Handling

Deletions are handled via deletion records:

1. When document is deleted, create deletion record
2. Deletion record includes version at time of deletion
3. Client removes document when deletion record received
4. Prevents re-creation of deleted items

```typescript
// Deletion sync
const deletions = await fetchDeletions(collection, since);
for (const deletion of deletions) {
  await storage.deleteDocument(
    deletion.collection,
    deletion.id,
    deletion.deletedBy,
    deletion.version
  );
}
```

## Sync Optimization

### Pagination

Large collections are paginated:

```typescript
const response = await fetchSync({
  collection: 'events',
  limit: 100,
  offset: 0,
});

// If hasMore, fetch next page
if (response.hasMore) {
  await fetchSync({
    collection: 'events',
    limit: 100,
    offset: 100,
  });
}
```

### Batch Operations

Multiple updates are batched:

```typescript
// Batch multiple updates
socketHandler.emitDocumentUpdated(doc1);
socketHandler.emitDocumentUpdated(doc2);
socketHandler.emitDocumentUpdated(doc3);

// Client receives and processes in batch
```

### Debouncing

Rapid updates are debounced:

```typescript
// Auto-sync is debounced (30s default)
// Multiple rapid changes result in single sync
```

## Offline Behavior

### Offline Mode

When offline:

1. Client continues using IndexedDB data
2. Changes are queued (future feature)
3. Sync attempts fail gracefully
4. Status set to `OFFLINE`

### Coming Online

When connection restored:

1. Detect connection restored
2. Get `lastSync` from IndexedDB
3. Incremental sync for all collections
4. Apply queued changes (future feature)
5. Status set to `IDLE`

## Sync Status

### Status States

```typescript
enum SyncStatus {
  IDLE = 'idle',        // Ready, no active sync
  SYNCING = 'syncing',  // Currently syncing
  OFFLINE = 'offline',  // No connection
  ERROR = 'error',      // Error state
}
```

### Status Transitions

```
IDLE → SYNCING → IDLE (success)
IDLE → SYNCING → ERROR (failure)
IDLE → OFFLINE (connection lost)
OFFLINE → IDLE (connection restored)
ERROR → IDLE (retry successful)
```

## Error Handling

### Network Errors

```typescript
try {
  await syncClient.syncCollection('events');
} catch (error) {
  if (error instanceof NetworkError) {
    // Retry with exponential backoff
    await retrySync();
  }
}
```

### Permission Errors

```typescript
// Permission denied
if (error.code === 'PERMISSION_DENIED') {
  // Remove unauthorized data
  await storage.clearCollection('events');
}
```

### Storage Errors

```typescript
// Storage quota exceeded
if (error.name === 'QuotaExceededError') {
  // Trigger cleanup
  await storage.ensureStorageSpace();
}
```

## Best Practices

1. **Use Incremental Sync**: Always prefer incremental over full sync
2. **Track lastSync**: Store lastSync timestamp reliably
3. **Handle Errors**: Implement proper error handling and retry logic
4. **Monitor Status**: Track sync status for user feedback
5. **Optimize Frequency**: Balance sync frequency with performance
6. **Batch Updates**: Group multiple updates when possible

## Performance Tips

1. **Limit Collections**: Only subscribe to needed collections
2. **Use Filters**: Filter data on server when possible
3. **Pagination**: Use pagination for large collections
4. **Cache Permissions**: Cache user permissions to reduce checks
5. **Debounce Sync**: Avoid too-frequent syncs

## Next Steps

- [Offline Support](./12-offline-support.md)
- [Real-time Updates](./13-realtime-updates.md)
- [Client API Reference](./08-client-api.md)
