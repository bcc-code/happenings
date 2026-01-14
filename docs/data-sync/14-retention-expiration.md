# Retention & Expiration

## Overview

The data sync system provides automatic data lifecycle management through expiration dates and retention priorities.

## Expiration

### Setting Expiration

Documents can have optional expiration dates:

```typescript
const document: SyncDocument = {
  id: 'notification-123',
  collection: 'notifications',
  data: { message: 'Hello' },
  metadata: {
    // ... other metadata
    expiresAt: new Date('2024-12-31T23:59:59Z'),
    retentionPriority: RetentionPriority.LOW,
  },
};
```

### Automatic Cleanup

Expired documents are automatically removed:

```typescript
// Runs automatically during sync
// Or manually:
const removed = await storage.cleanupExpired();
console.log(`Removed ${removed} expired documents`);
```

### Use Cases

- **Notifications**: Expire after 30 days
- **Cache**: Expire after 1 hour
- **Temporary Data**: Expire after 24 hours
- **Session Data**: Expire after session ends

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

When storage limit is reached:

1. **Sort by Priority**: Lowest priority first
2. **Sort by Age**: Oldest documents first
3. **Remove**: Delete oldest, lowest priority documents
4. **Buffer**: Keep 20% storage buffer

```typescript
// Example eviction order:
// 1. TEMPORARY, oldest first
// 2. LOW, oldest first
// 3. MEDIUM, oldest first
// 4. HIGH, oldest first
// 5. CRITICAL (never removed unless expired)
```

## Storage Management

### Storage Limits

Default: 50MB (configurable)

```typescript
const client = createSyncClient({
  maxStorageSize: 100 * 1024 * 1024, // 100MB
});
```

### Monitoring Storage

```typescript
const stats = await syncClient.getStorageStats();

console.log('Total size:', stats.totalSize);
console.log('Document count:', stats.documentCount);
console.log('Collections:', stats.collectionCount);

// Check if near limit
if (stats.totalSize > maxStorageSize * 0.8) {
  console.warn('Storage nearly full');
}
```

### Manual Cleanup

```typescript
// Clean expired documents
const expired = await storage.cleanupExpired();

// Ensure storage space
await storage.ensureStorageSpace();
```

## Best Practices

### 1. Set Appropriate Priorities

```typescript
// Critical user data
metadata: {
  retentionPriority: RetentionPriority.CRITICAL,
  // No expiration
}

// Frequently accessed data
metadata: {
  retentionPriority: RetentionPriority.HIGH,
}

// Standard documents
metadata: {
  retentionPriority: RetentionPriority.MEDIUM,
}

// Historical data
metadata: {
  retentionPriority: RetentionPriority.LOW,
}

// Temporary data
metadata: {
  retentionPriority: RetentionPriority.TEMPORARY,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
}
```

### 2. Combine Expiration and Priority

```typescript
// Temporary notification
metadata: {
  retentionPriority: RetentionPriority.TEMPORARY,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
}

// Important but time-limited
metadata: {
  retentionPriority: RetentionPriority.HIGH,
  expiresAt: new Date('2024-12-31'),
}
```

### 3. Monitor Storage

```typescript
// Periodic storage check
setInterval(async () => {
  const stats = await syncClient.getStorageStats();
  
  if (stats.totalSize > maxStorageSize * 0.9) {
    // Trigger aggressive cleanup
    await storage.ensureStorageSpace();
  }
}, 60000); // Every minute
```

## Examples

### Notification with Expiration

```typescript
const notification: SyncDocument = {
  id: `notification-${Date.now()}`,
  collection: 'notifications',
  data: {
    message: 'New event available',
    type: 'info',
  },
  metadata: {
    version: 1,
    lastModified: new Date(),
    retentionPriority: RetentionPriority.TEMPORARY,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
};
```

### Critical User Data

```typescript
const userSettings: SyncDocument = {
  id: `settings-${userId}`,
  collection: 'settings',
  data: {
    theme: 'dark',
    language: 'en',
  },
  metadata: {
    version: 1,
    lastModified: new Date(),
    retentionPriority: RetentionPriority.CRITICAL,
    // No expiration - keep forever
  },
};
```

### Cache Data

```typescript
const cache: SyncDocument = {
  id: `cache-${key}`,
  collection: 'cache',
  data: { /* cached data */ },
  metadata: {
    version: 1,
    lastModified: new Date(),
    retentionPriority: RetentionPriority.TEMPORARY,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  },
};
```

## Configuration

### Storage Size

```typescript
// Small device (mobile)
maxStorageSize: 25 * 1024 * 1024, // 25MB

// Standard device
maxStorageSize: 50 * 1024 * 1024, // 50MB

// Large device
maxStorageSize: 100 * 1024 * 1024, // 100MB
```

### Cleanup Frequency

Cleanup runs automatically:
- During sync operations
- When storage limit is reached
- On manual trigger

## Troubleshooting

### Storage Full

**Problem**: `QuotaExceededError` when storing

**Solutions**:
1. Increase `maxStorageSize` (if appropriate)
2. Set lower priorities for non-critical data
3. Set expiration dates
4. Clear old collections manually

### Documents Removed Unexpectedly

**Problem**: Important documents being removed

**Solutions**:
1. Check retention priority (should be HIGH or CRITICAL)
2. Verify expiration date is not set
3. Increase `maxStorageSize`
4. Review eviction logs

## Next Steps

- [Offline Support](./12-offline-support.md)
- [Client API Reference](./08-client-api.md)
- [Performance Guide](./15-performance.md)
