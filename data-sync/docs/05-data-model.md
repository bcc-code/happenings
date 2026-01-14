# Data Model

## Core Types

### SyncDocument

The fundamental data structure representing a synchronized document.

```typescript
interface SyncDocument<T = Record<string, unknown>> {
  id: string;                    // Unique document identifier
  collection: string;            // Collection name
  data: T;                       // Document data (generic)
  metadata: SyncMetadata;        // Sync metadata
}
```

**Example:**

```typescript
const event: SyncDocument<EventData> = {
  id: 'event-123',
  collection: 'events',
  data: {
    title: 'Summer Conference',
    date: '2024-07-15',
    location: 'San Francisco',
  },
  metadata: {
    version: 5,
    lastModified: new Date('2024-01-15T10:30:00Z'),
    lastSynced: new Date('2024-01-15T10:35:00Z'),
    expiresAt: new Date('2024-12-31T23:59:59Z'),
    retentionPriority: RetentionPriority.MEDIUM,
  },
};
```

### SyncMetadata

Metadata attached to every document for synchronization and lifecycle management.

```typescript
interface SyncMetadata {
  version: number;               // Incremented on each update
  lastModified: Date;            // Last modification timestamp
  lastSynced?: Date;             // Last sync with server
  expiresAt?: Date;              // Optional expiration date
  retentionPriority: RetentionPriority;  // Storage priority
  deletedAt?: Date;              // Deletion timestamp (tombstone)
  deletedBy?: string;            // User who deleted
}
```

### RetentionPriority

Enumeration of storage priority levels. Lower numbers = higher priority.

```typescript
enum RetentionPriority {
  CRITICAL = 1,    // Never removed (unless expired)
  HIGH = 2,        // Removed last
  MEDIUM = 3,      // Normal priority
  LOW = 4,         // Removed earlier
  TEMPORARY = 5,   // Removed first
}
```

**Usage Guidelines:**

- **CRITICAL**: User data, settings, critical business data
- **HIGH**: Frequently accessed data, active records
- **MEDIUM**: Standard documents, regular data
- **LOW**: Historical data, archived records
- **TEMPORARY**: Cache, temporary notifications, logs

### DeletionRecord

Tombstone record for deleted documents, allowing proper sync of deletions.

```typescript
interface DeletionRecord {
  id: string;                    // Deleted document ID
  collection: string;            // Collection name
  deletedAt: Date;                // Deletion timestamp
  deletedBy: string;              // User who deleted
  version: number;                // Version at time of deletion
}
```

**Purpose:**

- Tracks deleted documents for sync
- Prevents re-creation of deleted items
- Allows clients to remove local copies

## Permission Types

### Permission

Defines access control for collections and items.

```typescript
interface Permission {
  id: string;                    // Permission ID
  userId?: string;               // User ID (if user-specific)
  groupId?: string;              // Group ID (if group-based)
  collection: string;           // Collection name
  itemId?: string;              // Item ID (optional, for item-level)
  actions: PermissionAction[];   // Allowed actions
  scope: PermissionScope;       // Collection or Item scope
  createdAt: Date;
  updatedAt: Date;
}
```

**Examples:**

```typescript
// User can read all events
{
  userId: 'user-123',
  collection: 'events',
  actions: ['read'],
  scope: PermissionScope.COLLECTION,
}

// Group can write to specific event
{
  groupId: 'admins',
  collection: 'events',
  itemId: 'event-456',
  actions: ['read', 'write', 'delete'],
  scope: PermissionScope.ITEM,
}
```

### PermissionAction

```typescript
enum PermissionAction {
  READ = 'read',      // View documents
  WRITE = 'write',    // Create/update documents
  DELETE = 'delete',  // Delete documents
  ADMIN = 'admin',    // Full access (includes all actions)
}
```

### PermissionScope

```typescript
enum PermissionScope {
  COLLECTION = 'collection',  // Applies to entire collection
  ITEM = 'item',              // Applies to specific item
}
```

## Event Types

### SyncEvent

Real-time event structure for Socket.io communication.

```typescript
interface SyncEvent {
  type: SyncEventType;          // Event type
  collection: string;            // Collection name
  documentId?: string;           // Document ID (if applicable)
  document?: SyncDocument;       // Document data (if applicable)
  timestamp: Date;               // Event timestamp
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

Request structure for fetching sync data.

```typescript
interface SyncRequest {
  collection: string;           // Collection to sync
  since?: Date;                 // Only fetch changes since this date
  limit?: number;               // Maximum documents to return
  offset?: number;              // Pagination offset
}
```

### SyncResponse

Response structure from sync endpoint.

```typescript
interface SyncResponse {
  collection: string;           // Collection name
  documents: SyncDocument[];    // Documents to sync
  deletions: DeletionRecord[]; // Deletion records
  hasMore: boolean;              // More data available
  syncToken?: string;           // Token for next sync (optional)
}
```

## Configuration Types

### SyncClientConfig

Client configuration options.

```typescript
interface SyncClientConfig {
  apiUrl: string;               // API base URL
  socketUrl: string;            // Socket.io server URL
  authToken: string;            // Authentication token
  dbName?: string;              // IndexedDB database name (default: 'data-sync')
  maxStorageSize?: number;      // Max storage in bytes (default: 50MB)
  syncInterval?: number;        // Auto-sync interval in ms (default: 30000)
  reconnectDelay?: number;     // Reconnection delay in ms (default: 1000)
}
```

### SubscriptionOptions

Options for collection subscriptions.

```typescript
interface SubscriptionOptions {
  onUpdate?: (documents: SyncDocument[]) => void;
  onDelete?: (ids: string[]) => void;
  onError?: (error: Error) => void;
  filters?: Record<string, unknown>;  // Optional filters (future feature)
}
```

## State Types

### SyncStatus

Current synchronization status.

```typescript
enum SyncStatus {
  IDLE = 'idle',        // Ready, no active sync
  SYNCING = 'syncing',  // Currently syncing
  OFFLINE = 'offline',  // No connection
  ERROR = 'error',      // Error state
}
```

### SyncState

Current sync state information.

```typescript
interface SyncState {
  status: SyncStatus;           // Current status
  lastSync?: Date;             // Last successful sync
  error?: Error;               // Current error (if any)
  collections: string[];       // Subscribed collections
}
```

### StorageStats

Storage statistics.

```typescript
interface StorageStats {
  totalSize: number;           // Total storage used (bytes)
  documentCount: number;       // Number of documents
  collectionCount: number;     // Number of collections
  oldestDocument?: Date;       // Oldest document timestamp
  newestDocument?: Date;       // Newest document timestamp
}
```

## Type Safety

All types are exported from the package:

```typescript
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
```

## Best Practices

1. **Always include metadata**: Every document needs complete metadata
2. **Set appropriate priorities**: Use retention priority wisely
3. **Version documents**: Increment version on each update
4. **Track deletions**: Always create deletion records
5. **Use TypeScript**: Leverage type safety for your data types

## Next Steps

- [Permission System](./06-permissions.md)
- [Client API Reference](./08-client-api.md)
- [Types Reference](./10-types-reference.md)
