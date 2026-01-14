# Extending the System

## Overview

Guide for extending the data sync system with custom functionality.

## Extension Points

### 1. Custom Storage Backend

Replace IndexedDB with custom storage:

```typescript
interface StorageBackend {
  init(): Promise<void>;
  putDocument(document: SyncDocument): Promise<void>;
  getDocument(collection: string, id: string): Promise<SyncDocument | undefined>;
  getDocuments(collection: string): Promise<SyncDocument[]>;
  deleteDocument(collection: string, id: string): Promise<void>;
  clear(): Promise<void>;
}

class CustomStorage implements StorageBackend {
  // Implement interface
}

// Use custom storage
class ExtendedSyncClient extends SyncClient {
  constructor(config: SyncClientConfig, storage: StorageBackend) {
    super(config);
    this.storage = storage;
  }
}
```

### 2. Custom Transport

Replace Socket.io with custom transport:

```typescript
interface Transport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(collection: string): void;
  unsubscribe(collection: string): void;
  on(event: string, handler: Function): void;
  emit(event: string, data: unknown): void;
}

class WebSocketTransport implements Transport {
  // Implement interface
}
```

### 3. Custom Permission System

Replace permission system:

```typescript
interface PermissionChecker {
  checkPermission(
    userId: string,
    collection: string,
    itemId: string | undefined,
    action: PermissionAction
  ): Promise<boolean>;
}

class CustomPermissionChecker implements PermissionChecker {
  // Implement interface
}
```

## Custom Sync Strategies

### 1. Conflict Resolution

Implement custom conflict resolution:

```typescript
interface ConflictResolver {
  resolve(
    local: SyncDocument,
    server: SyncDocument
  ): Promise<SyncDocument>;
}

class LastWriteWinsResolver implements ConflictResolver {
  async resolve(local: SyncDocument, server: SyncDocument) {
    if (server.metadata.version > local.metadata.version) {
      return server;
    }
    return local;
  }
}

class MergeResolver implements ConflictResolver {
  async resolve(local: SyncDocument, server: SyncDocument) {
    // Merge both documents
    return {
      ...server,
      data: { ...local.data, ...server.data },
    };
  }
}
```

### 2. Custom Sync Filters

Add custom filtering:

```typescript
interface SyncFilter {
  shouldSync(document: SyncDocument): boolean;
}

class DateRangeFilter implements SyncFilter {
  constructor(private start: Date, private end: Date) {}
  
  shouldSync(document: SyncDocument): boolean {
    const date = document.data.date;
    return date >= this.start && date <= this.end;
  }
}
```

## Custom Event Handlers

### 1. Document Transformers

Transform documents on sync:

```typescript
interface DocumentTransformer {
  transform(document: SyncDocument): SyncDocument;
}

class DateTransformer implements DocumentTransformer {
  transform(document: SyncDocument) {
    return {
      ...document,
      data: {
        ...document.data,
        date: new Date(document.data.date),
      },
    };
  }
}
```

### 2. Validation

Add document validation:

```typescript
interface DocumentValidator {
  validate(document: SyncDocument): Promise<boolean>;
}

class SchemaValidator implements DocumentValidator {
  constructor(private schema: ZodSchema) {}
  
  async validate(document: SyncDocument) {
    return this.schema.safeParse(document.data).success;
  }
}
```

## Integration Examples

### Custom Storage with LocalStorage

```typescript
class LocalStorageBackend implements StorageBackend {
  async putDocument(document: SyncDocument) {
    const key = `${document.collection}:${document.id}`;
    localStorage.setItem(key, JSON.stringify(document));
  }
  
  async getDocument(collection: string, id: string) {
    const key = `${collection}:${id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : undefined;
  }
  
  // ... other methods
}
```

### Custom Permission System

```typescript
class RoleBasedPermissions implements PermissionChecker {
  async checkPermission(
    userId: string,
    collection: string,
    itemId: string | undefined,
    action: PermissionAction
  ) {
    const user = await getUser(userId);
    const role = user.role;
    
    // Role-based permission logic
    if (role === 'admin') return true;
    if (role === 'user' && action === PermissionAction.READ) return true;
    
    return false;
  }
}
```

## Best Practices

1. **Interface-Based**: Use interfaces for extensibility
2. **Composition**: Compose functionality rather than inherit
3. **Documentation**: Document extension points
4. **Testing**: Test extensions thoroughly
5. **Backwards Compatible**: Maintain backwards compatibility

## Next Steps

- [Plugin Development](./16-plugin-development.md)
- [Contributing Guide](./19-contributing.md)
- [API Reference](./08-client-api.md)
