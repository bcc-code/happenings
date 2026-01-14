# Testing

## Overview

Testing strategies and examples for the data sync system.

## Unit Testing

### Testing SyncClient

```typescript
import { describe, it, expect, beforeEach } from 'bun:test';
import { createSyncClient } from '@bcc-events/data-sync/client';

describe('SyncClient', () => {
  let client: SyncClient;
  
  beforeEach(() => {
    client = createSyncClient({
      apiUrl: 'http://localhost:3000',
      socketUrl: 'http://localhost:3000',
      authToken: 'test-token',
    });
  });
  
  it('should initialize', async () => {
    await client.init();
    expect(client.getState().status).toBe(SyncStatus.IDLE);
  });
  
  it('should subscribe to collection', () => {
    const unsubscribe = client.subscribe('events', {
      onUpdate: () => {},
    });
    
    expect(unsubscribe).toBeDefined();
    unsubscribe();
  });
});
```

### Testing SyncStorage

```typescript
import { SyncStorage } from '@bcc-events/data-sync/client';

describe('SyncStorage', () => {
  let storage: SyncStorage;
  
  beforeEach(async () => {
    storage = new SyncStorage('test-db');
    await storage.init();
  });
  
  afterEach(async () => {
    await storage.clear();
    await storage.close();
  });
  
  it('should store and retrieve documents', async () => {
    const doc: SyncDocument = {
      id: 'test-1',
      collection: 'test',
      data: { value: 123 },
      metadata: {
        version: 1,
        lastModified: new Date(),
        retentionPriority: RetentionPriority.MEDIUM,
      },
    };
    
    await storage.putDocument(doc);
    const retrieved = await storage.getDocument('test', 'test-1');
    
    expect(retrieved).toEqual(doc);
  });
});
```

## Integration Testing

### Testing Sync Flow

```typescript
describe('Sync Integration', () => {
  it('should sync documents from server', async () => {
    // Mock server
    const server = createMockServer();
    
    // Create client
    const client = createSyncClient({
      apiUrl: server.url,
      socketUrl: server.url,
      authToken: 'test',
    });
    
    await client.init();
    
    // Sync collection
    await client.syncCollection('events');
    
    // Verify documents
    const documents = await client.getDocuments('events');
    expect(documents.length).toBeGreaterThan(0);
  });
});
```

### Testing Real-time Updates

```typescript
describe('Real-time Updates', () => {
  it('should receive updates via Socket.io', async () => {
    const updates: SyncDocument[] = [];
    
    const client = createSyncClient(config);
    await client.init();
    
    client.subscribe('events', {
      onUpdate: (docs) => {
        updates.push(...docs);
      },
    });
    
    // Emit update from server
    socketHandler.emitDocumentUpdated(document);
    
    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(updates.length).toBe(1);
  });
});
```

## Mocking

### Mock Server

```typescript
class MockSyncServer {
  private documents: Map<string, SyncDocument[]> = new Map();
  
  async getSyncResponse(request: SyncRequest): Promise<SyncResponse> {
    const docs = this.documents.get(request.collection) || [];
    
    return {
      collection: request.collection,
      documents: docs,
      deletions: [],
      hasMore: false,
    };
  }
  
  addDocument(document: SyncDocument) {
    const collection = this.documents.get(document.collection) || [];
    collection.push(document);
    this.documents.set(document.collection, collection);
  }
}
```

### Mock Storage

```typescript
class MockStorage implements StorageBackend {
  private documents: Map<string, SyncDocument> = new Map();
  
  async putDocument(document: SyncDocument) {
    const key = `${document.collection}:${document.id}`;
    this.documents.set(key, document);
  }
  
  async getDocument(collection: string, id: string) {
    const key = `${collection}:${id}`;
    return this.documents.get(key);
  }
  
  // ... other methods
}
```

## E2E Testing

### Testing Full Flow

```typescript
describe('E2E Sync Flow', () => {
  it('should sync end-to-end', async () => {
    // Setup server
    const server = await startTestServer();
    
    // Create client
    const client = createSyncClient({
      apiUrl: server.url,
      socketUrl: server.url,
      authToken: 'test',
    });
    
    await client.init();
    
    // Subscribe
    const updates: SyncDocument[] = [];
    client.subscribe('events', {
      onUpdate: (docs) => updates.push(...docs),
    });
    
    // Create document on server
    await server.createDocument('events', { title: 'Test' });
    
    // Wait for sync
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify
    const documents = await client.getDocuments('events');
    expect(documents.length).toBe(1);
    expect(updates.length).toBe(1);
  });
});
```

## Test Utilities

### Test Helpers

```typescript
export function createTestDocument(
  collection: string,
  id: string,
  data: unknown
): SyncDocument {
  return {
    id,
    collection,
    data,
    metadata: {
      version: 1,
      lastModified: new Date(),
      retentionPriority: RetentionPriority.MEDIUM,
    },
  };
}

export async function waitForSync(client: SyncClient, timeout = 1000) {
  const start = Date.now();
  while (client.getState().status === SyncStatus.SYNCING) {
    if (Date.now() - start > timeout) {
      throw new Error('Sync timeout');
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Clean Up**: Clean up resources after tests
3. **Mock External**: Mock network and storage
4. **Test Edge Cases**: Test error conditions
5. **Fast Tests**: Keep tests fast
6. **Clear Assertions**: Use clear, descriptive assertions

## Next Steps

- [Contributing Guide](./19-contributing.md)
- [Plugin Development](./16-plugin-development.md)
