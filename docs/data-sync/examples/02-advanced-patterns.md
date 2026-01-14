# Advanced Patterns

## Multiple Collections

```typescript
const events = useSyncCollection(sync.client, 'events');
const registrations = useSyncCollection(sync.client, 'registrations');
const users = useSyncCollection(sync.client, 'users');

onMounted(() => {
  events.start();
  registrations.start();
  users.start();
});
```

## Conditional Subscription

```typescript
const showEvents = ref(true);
const events = useSyncCollection(sync.client, 'events');

watch(showEvents, (value) => {
  if (value) {
    events.start();
  } else {
    events.stop();
  }
});
```

## Error Handling

```typescript
const { documents, error, start } = useSyncCollection(
  sync.client,
  'events'
);

watch(error, (err) => {
  if (err) {
    showNotification({
      type: 'error',
      message: `Sync error: ${err.message}`,
    });
  }
});
```

## Storage Management

```typescript
// Monitor storage
const stats = await syncClient.getStorageStats();

if (stats.totalSize > maxStorageSize * 0.8) {
  // Trigger cleanup
  await storage.ensureStorageSpace();
}
```

## Custom Priorities

```typescript
const document: SyncDocument = {
  id: 'doc-1',
  collection: 'events',
  data: { /* ... */ },
  metadata: {
    retentionPriority: RetentionPriority.CRITICAL,
    expiresAt: undefined, // Never expire
  },
};
```
