# Real-time Updates

## Overview

Real-time updates are delivered via Socket.io, providing instant synchronization across all connected clients.

## How It Works

### Socket.io Integration

```
Server                    Clients
  │                         │
  │── Document Updated      │
  │                         │
  │── Emit Event ──────────►│ Client 1
  │                         │── Receive Event
  │                         │── Update IndexedDB
  │                         │── Notify Subscribers
  │                         │
  │── Emit Event ──────────►│ Client 2
  │                         │── Receive Event
  │                         │── Update IndexedDB
  │                         │── Notify Subscribers
```

### Event Flow

1. **Server**: Document created/updated/deleted
2. **Server**: Emit Socket.io event to subscribers
3. **Client**: Receive event
4. **Client**: Update IndexedDB
5. **Client**: Notify subscribers (callbacks)
6. **Client**: Update UI (if subscribed)

## Server-Side

### Emitting Events

```typescript
import { SocketHandler } from '@bcc-events/data-sync/server';

// Document created
socketHandler.emitDocumentCreated(document);

// Document updated
socketHandler.emitDocumentUpdated(document);

// Document deleted
socketHandler.emitDocumentDeleted('events', 'event-123', userId);
```

### Event Types

```typescript
enum SyncEventType {
  DOCUMENT_CREATED = 'document:created',
  DOCUMENT_UPDATED = 'document:updated',
  DOCUMENT_DELETED = 'document:deleted',
  COLLECTION_CLEARED = 'collection:cleared',
}
```

### Integration Example

```typescript
// In your API route handler
app.post('/api/events', async ({ body, store }) => {
  // Create document
  const document = await createEvent(body);
  
  // Emit to subscribers
  socketHandler.emitDocumentCreated(document);
  
  return document;
});

app.put('/api/events/:id', async ({ params, body, store }) => {
  // Update document
  const document = await updateEvent(params.id, body);
  
  // Emit to subscribers
  socketHandler.emitDocumentUpdated(document);
  
  return document;
});

app.delete('/api/events/:id', async ({ params, store }) => {
  // Delete document
  await deleteEvent(params.id);
  
  // Create deletion record
  await createDeletionRecord('events', params.id, store.userId);
  
  // Emit to subscribers
  socketHandler.emitDocumentDeleted('events', params.id, store.userId);
  
  return { success: true };
});
```

## Client-Side

### Subscribing to Updates

```typescript
const unsubscribe = syncClient.subscribe('events', {
  onUpdate: (documents) => {
    console.log('Events updated:', documents);
    // Update UI
  },
  onDelete: (ids) => {
    console.log('Events deleted:', ids);
    // Remove from UI
  },
  onError: (error) => {
    console.error('Sync error:', error);
  },
});
```

### Automatic Updates

Updates are automatically applied to IndexedDB and subscribers are notified:

```typescript
// No manual action needed - updates happen automatically
syncClient.subscribe('events', {
  onUpdate: (docs) => {
    // This is called automatically when server emits update
    updateUI(docs);
  },
});
```

## Event Structure

### SyncEvent

```typescript
interface SyncEvent {
  type: SyncEventType;
  collection: string;
  documentId?: string;
  document?: SyncDocument;
  timestamp: Date;
}
```

### Example Events

```typescript
// Document created
{
  type: 'document:created',
  collection: 'events',
  documentId: 'event-123',
  document: { /* SyncDocument */ },
  timestamp: new Date(),
}

// Document updated
{
  type: 'document:updated',
  collection: 'events',
  documentId: 'event-123',
  document: { /* Updated SyncDocument */ },
  timestamp: new Date(),
}

// Document deleted
{
  type: 'document:deleted',
  collection: 'events',
  documentId: 'event-123',
  timestamp: new Date(),
}
```

## Connection Management

### Automatic Reconnection

Socket.io automatically handles reconnection:

```typescript
// Configured in SyncClient
const client = createSyncClient({
  // ... other config
  reconnectDelay: 1000, // 1 second delay
});
```

### Connection Status

```typescript
// Monitor connection status
watch(() => sync.state.value?.status, (status) => {
  if (status === SyncStatus.OFFLINE) {
    console.log('Disconnected from server');
  } else if (status === SyncStatus.IDLE) {
    console.log('Connected to server');
  }
});
```

## Subscription Management

### Subscribing to Collections

```typescript
// Subscribe to multiple collections
syncClient.subscribe('events', { onUpdate: handleEvents });
syncClient.subscribe('registrations', { onUpdate: handleRegistrations });
syncClient.subscribe('users', { onUpdate: handleUsers });
```

### Unsubscribing

```typescript
const unsubscribe = syncClient.subscribe('events', { /* ... */ });

// Later, unsubscribe
unsubscribe();
```

## Performance

### Batch Updates

Multiple rapid updates are handled efficiently:

```typescript
// Server emits multiple updates
socketHandler.emitDocumentUpdated(doc1);
socketHandler.emitDocumentUpdated(doc2);
socketHandler.emitDocumentUpdated(doc3);

// Client processes efficiently
// - Single IndexedDB transaction
// - Single subscriber notification
```

### Filtering

Only subscribed collections receive events:

```typescript
// Client subscribes to 'events'
syncClient.subscribe('events', { /* ... */ });

// Server emits update for 'events'
socketHandler.emitDocumentUpdated(eventDoc);
// ✅ Client receives update

// Server emits update for 'users'
socketHandler.emitDocumentUpdated(userDoc);
// ❌ Client does NOT receive (not subscribed)
```

## Security

### Authentication

Socket.io connections require authentication:

```typescript
const socketHandler = new SocketHandler(io, {
  verifyToken: async (token) => {
    const user = await verifyAuth0Token(token);
    return user ? { userId: user.sub } : null;
  },
});
```

### Permission Filtering

Events are filtered by permissions on the server:

```typescript
// Only users with permission receive events
// Server checks permissions before emitting
```

## Best Practices

1. **Emit After Save**: Always emit events after database operations
2. **Include Full Document**: Send complete document in update events
3. **Handle Errors**: Implement error handling in subscribers
4. **Monitor Connection**: Track connection status for user feedback
5. **Batch Operations**: Group multiple updates when possible

## Troubleshooting

### Events Not Received

**Problem**: Client not receiving events

**Solutions**:
1. Check client is subscribed to collection
2. Verify Socket.io connection is established
3. Check server is emitting events
4. Review browser console for errors

### Connection Drops

**Problem**: Connection frequently disconnects

**Solutions**:
1. Check network stability
2. Increase reconnect delay
3. Review server logs
4. Check CORS configuration

## Next Steps

- [Offline Support](./12-offline-support.md)
- [Sync Strategy](./07-sync-strategy.md)
- [Client API Reference](./08-client-api.md)
