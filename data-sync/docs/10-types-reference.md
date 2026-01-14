# Types Reference

Complete TypeScript type definitions for the data sync package.

## Core Types

### SyncDocument

```typescript
interface SyncDocument<T = Record<string, unknown>> {
  id: string;
  collection: string;
  data: T;
  metadata: SyncMetadata;
}
```

### SyncMetadata

```typescript
interface SyncMetadata {
  version: number;
  lastModified: Date;
  lastSynced?: Date;
  expiresAt?: Date;
  retentionPriority: RetentionPriority;
  deletedAt?: Date;
  deletedBy?: string;
}
```

### RetentionPriority

```typescript
enum RetentionPriority {
  CRITICAL = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
  TEMPORARY = 5,
}
```

### DeletionRecord

```typescript
interface DeletionRecord {
  id: string;
  collection: string;
  deletedAt: Date;
  deletedBy: string;
  version: number;
}
```

## Permission Types

### Permission

```typescript
interface Permission {
  id: string;
  userId?: string;
  groupId?: string;
  collection: string;
  itemId?: string;
  actions: PermissionAction[];
  scope: PermissionScope;
  createdAt: Date;
  updatedAt: Date;
}
```

### PermissionAction

```typescript
enum PermissionAction {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
}
```

### PermissionScope

```typescript
enum PermissionScope {
  COLLECTION = 'collection',
  ITEM = 'item',
}
```

## Event Types

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

### SyncEventType

```typescript
enum SyncEventType {
  DOCUMENT_CREATED = 'document:created',
  DOCUMENT_UPDATED = 'document:updated',
  DOCUMENT_DELETED = 'document:deleted',
  COLLECTION_CLEARED = 'collection:cleared',
  SYNC_COMPLETE = 'sync:complete',
  SYNC_ERROR = 'sync:error',
}
```

## Request/Response Types

### SyncRequest

```typescript
interface SyncRequest {
  collection: string;
  since?: Date;
  limit?: number;
  offset?: number;
}
```

### SyncResponse

```typescript
interface SyncResponse {
  collection: string;
  documents: SyncDocument[];
  deletions: DeletionRecord[];
  hasMore: boolean;
  syncToken?: string;
}
```

## Configuration Types

### SyncClientConfig

```typescript
interface SyncClientConfig {
  apiUrl: string;
  socketUrl: string;
  authToken: string;
  dbName?: string;
  maxStorageSize?: number;
  syncInterval?: number;
  reconnectDelay?: number;
}
```

### SyncServerConfig

```typescript
interface SyncServerConfig {
  port?: number;
  cors?: {
    origin: string | string[];
    credentials: boolean;
  };
}
```

### SubscriptionOptions

```typescript
interface SubscriptionOptions {
  onUpdate?: (documents: SyncDocument[]) => void;
  onDelete?: (ids: string[]) => void;
  onError?: (error: Error) => void;
  filters?: Record<string, unknown>;
}
```

## State Types

### SyncStatus

```typescript
enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  OFFLINE = 'offline',
  ERROR = 'error',
}
```

### SyncState

```typescript
interface SyncState {
  status: SyncStatus;
  lastSync?: Date;
  error?: Error;
  collections: string[];
}
```

### StorageStats

```typescript
interface StorageStats {
  totalSize: number;
  documentCount: number;
  collectionCount: number;
  oldestDocument?: Date;
  newestDocument?: Date;
}
```

## Server Types

### SyncServiceConfig

```typescript
interface SyncServiceConfig {
  getDocuments: (
    collection: string,
    since?: Date,
    limit?: number,
    offset?: number
  ) => Promise<SyncDocument[]>;
  
  getDeletions: (
    collection: string,
    since?: Date
  ) => Promise<DeletionRecord[]>;
  
  getUserPermissions: (
    userId: string
  ) => Promise<Permission[]>;
  
  getUserGroups: (
    userId: string
  ) => Promise<string[]>;
}
```

### SocketHandlerConfig

```typescript
interface SocketHandlerConfig {
  onSubscribe?: (socketId: string, collection: string) => void;
  onUnsubscribe?: (socketId: string, collection: string) => void;
  verifyToken?: (token: string) => Promise<{ userId: string } | null>;
}
```

## Type Guards

### Type Checking Utilities

```typescript
// Check if document is deleted
function isDeleted(doc: SyncDocument): boolean {
  return doc.metadata.deletedAt !== undefined;
}

// Check if document is expired
function isExpired(doc: SyncDocument): boolean {
  if (!doc.metadata.expiresAt) return false;
  return doc.metadata.expiresAt < new Date();
}

// Check if sync is needed
function needsSync(doc: SyncDocument, lastSync: Date): boolean {
  return doc.metadata.lastModified > lastSync;
}
```

## Generic Types

### Typed Documents

```typescript
// Define your data type
interface EventData {
  title: string;
  date: Date;
  location: string;
}

// Use typed document
type EventDocument = SyncDocument<EventData>;

const event: EventDocument = {
  id: 'event-123',
  collection: 'events',
  data: {
    title: 'Conference',
    date: new Date(),
    location: 'SF',
  },
  metadata: { /* ... */ },
};
```

## Utility Types

### Partial SyncDocument

```typescript
type PartialSyncDocument<T> = Partial<SyncDocument<T>>;
```

### Document ID

```typescript
type DocumentId = string;
```

### Collection Name

```typescript
type CollectionName = string;
```

## Importing Types

```typescript
// Import all types
import type {
  SyncDocument,
  SyncMetadata,
  RetentionPriority,
  Permission,
  PermissionAction,
  SyncEvent,
  SyncRequest,
  SyncResponse,
  SyncClientConfig,
  SyncStatus,
  SyncState,
} from '@bcc-events/data-sync';

// Import from specific modules
import type { SyncDocument } from '@bcc-events/data-sync/types';
import type { SyncClientConfig } from '@bcc-events/data-sync/client';
```

## Type Safety Tips

1. **Use Generic Types**: Leverage `SyncDocument<T>` for type safety
2. **Type Guards**: Use type guards for runtime checks
3. **Strict Mode**: Enable TypeScript strict mode
4. **Type Inference**: Let TypeScript infer types where possible
5. **Explicit Types**: Use explicit types for public APIs

## Next Steps

- [Client API Reference](./08-client-api.md)
- [Server API Reference](./09-server-api.md)
- [Data Model](./05-data-model.md)
