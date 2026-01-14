# Performance Optimization

## Overview

Performance optimization strategies for the data sync system.

## Client-Side Optimization

### 1. Limit Subscriptions

Only subscribe to collections you need:

```typescript
// ✅ Good - only subscribe to needed collections
syncClient.subscribe('events', { onUpdate: handleEvents });

// ❌ Bad - subscribing to everything
syncClient.subscribe('events', { /* ... */ });
syncClient.subscribe('users', { /* ... */ });
syncClient.subscribe('registrations', { /* ... */ });
syncClient.subscribe('sessions', { /* ... */ });
// ... many more
```

### 2. Use Incremental Sync

Always prefer incremental over full sync:

```typescript
// ✅ Good - incremental sync
await syncClient.syncCollection('events', lastSyncDate);

// ❌ Bad - full sync every time
await syncClient.syncCollection('events');
```

### 3. Debounce Sync Operations

Avoid too-frequent syncs:

```typescript
let syncTimeout: number;

function debouncedSync() {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncClient.syncCollection('events');
  }, 1000); // Wait 1 second
}
```

### 4. Pagination

Use pagination for large collections:

```typescript
// Server-side pagination
const response = await fetchSync({
  collection: 'events',
  limit: 100,
  offset: 0,
});

// Fetch next page if needed
if (response.hasMore) {
  await fetchSync({
    collection: 'events',
    limit: 100,
    offset: 100,
  });
}
```

### 5. IndexedDB Indexes

Leverage IndexedDB indexes for fast queries:

```typescript
// Indexes are automatically created:
// - collection
// - expiresAt
// - lastModified
// - priority

// Fast queries by collection
const events = await storage.getDocuments('events');

// Fast queries by date range
const recent = await storage.getDocumentsSince('events', since);
```

## Server-Side Optimization

### 1. Cache Permissions

Cache user permissions to reduce DB queries:

```typescript
const permissionCache = new Map<string, Permission[]>();

async function getCachedPermissions(userId: string) {
  if (permissionCache.has(userId)) {
    return permissionCache.get(userId)!;
  }
  
  const permissions = await db.query.permissions.findMany({
    where: eq(permissions.userId, userId),
  });
  
  permissionCache.set(userId, permissions);
  return permissions;
}
```

### 2. Batch Database Queries

Group multiple queries:

```typescript
// ✅ Good - single query
const [documents, deletions, permissions] = await Promise.all([
  getDocuments(collection),
  getDeletions(collection),
  getUserPermissions(userId),
]);

// ❌ Bad - sequential queries
const documents = await getDocuments(collection);
const deletions = await getDeletions(collection);
const permissions = await getUserPermissions(userId);
```

### 3. Database Indexes

Ensure proper database indexes:

```sql
-- Collection index
CREATE INDEX idx_documents_collection ON documents(collection);

-- UpdatedAt index for incremental sync
CREATE INDEX idx_documents_updated_at ON documents(updated_at);

-- User permissions index
CREATE INDEX idx_permissions_user_id ON permissions(user_id);
CREATE INDEX idx_permissions_group_id ON permissions(group_id);
```

### 4. Filter on Server

Filter data on server, not client:

```typescript
// ✅ Good - filter on server
const events = await db.query.events.findMany({
  where: and(
    eq(events.collection, 'events'),
    gte(events.updatedAt, since),
    eq(events.status, 'active')
  ),
});

// ❌ Bad - fetch all, filter on client
const allEvents = await db.query.events.findMany();
const events = allEvents.filter(e => e.status === 'active');
```

## Network Optimization

### 1. Compression

Enable gzip compression on server:

```typescript
// Elysia with compression
import { compression } from '@elysiajs/compression';

app.use(compression());
```

### 2. Connection Pooling

Reuse Socket.io connections:

```typescript
// Socket.io automatically pools connections
// No manual configuration needed
```

### 3. Request Batching

Batch multiple updates:

```typescript
// ✅ Good - batch updates
socketHandler.emitDocumentUpdated(doc1);
socketHandler.emitDocumentUpdated(doc2);
socketHandler.emitDocumentUpdated(doc3);

// Client receives and processes in batch
```

## Storage Optimization

### 1. Set Appropriate Priorities

Use retention priorities wisely:

```typescript
// Critical data - keep forever
retentionPriority: RetentionPriority.CRITICAL

// Temporary data - remove first
retentionPriority: RetentionPriority.TEMPORARY
```

### 2. Set Expiration Dates

Expire temporary data:

```typescript
// Expire after 24 hours
expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
```

### 3. Monitor Storage

Regularly check storage usage:

```typescript
const stats = await syncClient.getStorageStats();
if (stats.totalSize > maxStorageSize * 0.8) {
  // Trigger cleanup
  await storage.ensureStorageSpace();
}
```

## Monitoring

### Performance Metrics

Track key metrics:

```typescript
// Sync duration
const start = Date.now();
await syncClient.syncCollection('events');
const duration = Date.now() - start;
console.log(`Sync took ${duration}ms`);

// Storage usage
const stats = await syncClient.getStorageStats();
console.log(`Storage: ${stats.totalSize / 1024 / 1024}MB`);

// Document count
console.log(`Documents: ${stats.documentCount}`);
```

### Error Tracking

Monitor errors:

```typescript
syncClient.subscribe('events', {
  onError: (error) => {
    // Log to error tracking service
    errorTracker.log(error);
  },
});
```

## Best Practices Summary

1. **Limit Subscriptions**: Only subscribe to needed collections
2. **Use Incremental Sync**: Prefer incremental over full sync
3. **Cache Permissions**: Cache user permissions server-side
4. **Database Indexes**: Ensure proper indexes
5. **Filter on Server**: Don't fetch unnecessary data
6. **Set Priorities**: Use retention priorities appropriately
7. **Monitor Performance**: Track metrics and errors
8. **Batch Operations**: Group multiple operations
9. **Pagination**: Use pagination for large datasets
10. **Compression**: Enable server compression

## Next Steps

- [Client API Reference](./08-client-api.md)
- [Server API Reference](./09-server-api.md)
- [Architecture Details](./04-architecture.md)
