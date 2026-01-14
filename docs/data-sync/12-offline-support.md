# Offline Support

## Overview

The data sync package provides comprehensive offline support through IndexedDB storage, allowing applications to work without network connectivity.

## How It Works

### Storage Layer

All documents are stored locally in IndexedDB:

```
IndexedDB (data-sync)
├── documents (ObjectStore)
│   └── Stores all SyncDocuments
├── deletions (ObjectStore)
│   └── Stores deletion records
└── metadata (ObjectStore)
    └── Stores sync metadata
```

### Offline Behavior

1. **Data Access**: All reads come from IndexedDB (instant, no network)
2. **Sync Queue**: Changes are queued for when online (future feature)
3. **Status Tracking**: Client tracks online/offline status
4. **Auto-Reconnect**: Automatically syncs when connection restored

## Offline Mode

### Detecting Offline

```typescript
const state = syncClient.getState();

if (state.status === SyncStatus.OFFLINE) {
  console.log('Currently offline');
}
```

### Reading Offline Data

```typescript
// Works offline - reads from IndexedDB
const events = await syncClient.getDocuments('events');
const event = await syncClient.getDocument('events', 'event-123');
```

### Offline Status

```typescript
// Monitor offline status
watch(() => sync.state.value?.status, (status) => {
  if (status === SyncStatus.OFFLINE) {
    showOfflineBanner();
  } else {
    hideOfflineBanner();
  }
});
```

## Reconnection

### Automatic Reconnection

When connection is restored:

1. Client detects connection
2. Gets `lastSync` timestamp from IndexedDB
3. Performs incremental sync (only changes since lastSync)
4. Merges with existing data
5. Notifies subscribers of updates

```typescript
// Automatic - handled by sync client
// Just monitor status
watch(() => sync.state.value?.status, (status) => {
  if (status === SyncStatus.IDLE && wasOffline) {
    console.log('Back online and synced!');
  }
});
```

### Manual Reconnection

```typescript
// Force reconnection
await syncClient.syncAll();
```

## Storage Management

### Storage Limits

Default maximum storage: 50MB (configurable)

```typescript
const client = createSyncClient({
  // ... other config
  maxStorageSize: 100 * 1024 * 1024, // 100MB
});
```

### Storage Cleanup

Automatic cleanup happens when:
- Storage limit is reached
- Documents expire
- Low-priority documents are evicted

```typescript
// Manual cleanup
await storage.cleanupExpired();
await storage.ensureStorageSpace();
```

### Storage Statistics

```typescript
const stats = await syncClient.getStorageStats();
console.log('Storage used:', stats.totalSize);
console.log('Documents:', stats.documentCount);
console.log('Collections:', stats.collectionCount);
```

## Expiration

### Setting Expiration

```typescript
const document: SyncDocument = {
  id: 'notification-123',
  collection: 'notifications',
  data: { message: 'Hello' },
  metadata: {
    // ... other metadata
    expiresAt: new Date('2024-12-31'),
    retentionPriority: RetentionPriority.LOW,
  },
};
```

### Automatic Cleanup

Expired documents are automatically removed:

```typescript
// Runs automatically, or manually:
const removed = await storage.cleanupExpired();
console.log(`Removed ${removed} expired documents`);
```

## Retention Priority

### Priority Levels

```typescript
enum RetentionPriority {
  CRITICAL = 1,    // Never removed (unless expired)
  HIGH = 2,        // Removed last
  MEDIUM = 3,      // Normal priority
  LOW = 4,         // Removed earlier
  TEMPORARY = 5,   // Removed first
}
```

### Eviction Strategy

When storage is full:
1. Sort by priority (ascending)
2. Sort by lastModified (ascending)
3. Remove oldest, lowest priority documents
4. Keep 20% buffer

```typescript
// Set priority when creating document
const document: SyncDocument = {
  // ... other fields
  metadata: {
    retentionPriority: RetentionPriority.HIGH,
    // ... other metadata
  },
};
```

## Best Practices

### 1. Set Appropriate Priorities

```typescript
// Critical data
metadata: {
  retentionPriority: RetentionPriority.CRITICAL,
}

// Temporary data
metadata: {
  retentionPriority: RetentionPriority.TEMPORARY,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
}
```

### 2. Monitor Storage

```typescript
const stats = await syncClient.getStorageStats();
if (stats.totalSize > maxStorageSize * 0.8) {
  console.warn('Storage nearly full');
}
```

### 3. Handle Offline Gracefully

```vue
<template>
  <div v-if="isOffline" class="offline-banner">
    You're offline. Data loaded from cache.
  </div>
</template>

<script setup>
const isOffline = computed(() => 
  sync.state.value?.status === SyncStatus.OFFLINE
);
</script>
```

### 4. Show Sync Status

```vue
<template>
  <div class="sync-status">
    <span v-if="isSyncing">Syncing...</span>
    <span v-else-if="isOffline">Offline</span>
    <span v-else>Online</span>
  </div>
</template>
```

## Troubleshooting

### Storage Quota Exceeded

**Problem**: `QuotaExceededError` when storing documents

**Solutions**:
1. Increase `maxStorageSize` (if appropriate)
2. Set lower retention priorities
3. Set expiration dates for temporary data
4. Clear old data manually

```typescript
// Clear specific collection
await storage.clearCollection('old-events');
```

### Data Not Persisting

**Problem**: Data lost after page refresh

**Solutions**:
1. Ensure `init()` is called
2. Check IndexedDB is supported
3. Verify storage permissions
4. Check browser console for errors

### Sync Not Working After Reconnect

**Problem**: Changes not syncing after going online

**Solutions**:
1. Check `lastSync` timestamp is stored
2. Verify network connection
3. Check server is accessible
4. Review error logs

## Next Steps

- [Real-time Updates](./13-realtime-updates.md)
- [Retention & Expiration](./14-retention-expiration.md)
- [Client API Reference](./08-client-api.md)
