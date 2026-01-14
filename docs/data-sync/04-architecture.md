# Architecture

## System Overview

The data sync system follows a client-server architecture with real-time updates and offline support.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Vue Components  │  Composables  │  SyncClient  │  Storage │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
              HTTP/REST         Socket.io
                    │               │
┌───────────────────┴───────────────┴───────────────────────┐
│                    Network Layer                           │
└───────────────────┬───────────────┬───────────────────────┘
                    │               │
┌───────────────────┴───────────────┴───────────────────────┐
│                      Server Layer                         │
├───────────────────────────────────────────────────────────┤
│  Elysia Routes  │  SyncService  │  SocketHandler  │  DB   │
└───────────────────────────────────────────────────────────┘
```

## Component Architecture

### Client Components

#### SyncClient

The main synchronization engine that:
- Manages Socket.io connection
- Handles HTTP sync requests
- Coordinates storage operations
- Manages subscriptions

```typescript
SyncClient
├── Socket Connection (Socket.io)
├── HTTP Client (Fetch API)
├── Storage (SyncStorage)
└── Subscriptions (Map<collection, Set<callbacks>>)
```

#### SyncStorage

IndexedDB wrapper that:
- Stores documents and deletions
- Manages expiration and cleanup
- Handles retention priority
- Provides query interface

```typescript
SyncStorage
├── Documents Store (IndexedDB)
├── Deletions Store (IndexedDB)
└── Metadata Store (IndexedDB)
```

### Server Components

#### SyncService

Handles sync requests:
- Fetches documents from database
- Applies permission filters
- Returns sync responses

```typescript
SyncService
├── getDocuments()
├── getDeletions()
├── getUserPermissions()
└── getUserGroups()
```

#### SocketHandler

Manages real-time events:
- Handles Socket.io connections
- Manages subscriptions
- Broadcasts events to subscribers

```typescript
SocketHandler
├── Connection Management
├── Subscription Tracking
└── Event Broadcasting
```

## Data Flow

### 1. Initial Sync

```
Client                    Server
  │                         │
  │── HTTP GET /api/sync ──►│
  │                         │── Query DB
  │                         │── Apply Permissions
  │                         │── Return Documents
  │◄── JSON Response ───────│
  │                         │
  │── Store in IndexedDB    │
```

### 2. Real-time Update

```
Server                    Client
  │                         │
  │── Document Updated      │
  │                         │
  │── Emit Socket Event ───►│
  │                         │── Receive Event
  │                         │── Update IndexedDB
  │                         │── Notify Subscribers
```

### 3. Offline to Online

```
Client                    Server
  │                         │
  │── Connection Lost       │
  │── Continue Offline      │
  │                         │
  │── Connection Restored ──►│
  │                         │
  │── HTTP GET /api/sync ──►│
  │   (since: lastSync)     │
  │                         │── Return Changes Only
  │◄── Incremental Update ──│
  │                         │
  │── Merge Changes         │
```

## Storage Architecture

### IndexedDB Schema

```
data-sync (Database)
├── documents (ObjectStore)
│   ├── Key: [collection, id]
│   ├── Index: collection
│   ├── Index: expiresAt
│   ├── Index: lastModified
│   └── Index: priority
│
├── deletions (ObjectStore)
│   ├── Key: [collection, id]
│   ├── Index: collection
│   └── Index: deletedAt
│
└── metadata (ObjectStore)
    └── Key: string
```

### Document Structure

```typescript
SyncDocument {
  id: string
  collection: string
  data: T (generic)
  metadata: {
    version: number
    lastModified: Date
    lastSynced?: Date
    expiresAt?: Date
    retentionPriority: RetentionPriority
    deletedAt?: Date
    deletedBy?: string
  }
}
```

## Permission System

### Permission Model

```
Permission
├── Subject (User or Group)
├── Resource (Collection or Item)
└── Actions (Read, Write, Delete, Admin)
```

### Permission Check Flow

```
Request
  │
  ├── Get User Permissions
  ├── Get User Groups
  │
  ├── Check Collection Permission
  │   └── If itemId: Check Item Permission
  │
  └── Filter Results
```

## Sync Strategy

### Full Sync

- Used on first connection
- Fetches all documents in collection
- Stores complete state locally

### Incremental Sync

- Used on reconnection
- Fetches only changes since `lastSync`
- Merges with existing data
- Includes deletion records

### Real-time Sync

- Socket.io events for immediate updates
- No HTTP request needed
- Updates IndexedDB directly

## Retention & Cleanup

### Expiration

Documents with `expiresAt` are automatically removed when expired.

### Priority-Based Eviction

When storage limit is reached:
1. Sort by priority (ascending)
2. Sort by lastModified (ascending)
3. Remove oldest, lowest priority documents
4. Keep 20% buffer

## Error Handling

### Client Errors

- Network errors → Retry with exponential backoff
- Storage errors → Log and continue
- Permission errors → Clear unauthorized data

### Server Errors

- Invalid requests → Return 400
- Permission denied → Return 403
- Server errors → Return 500

## Security Considerations

1. **Authentication**: All requests require valid JWT token
2. **Authorization**: Permissions checked on every request
3. **Data Isolation**: Tenant/user context enforced
4. **Token Validation**: Socket.io connections verified

## Performance Optimizations

1. **IndexedDB Indexes**: Fast queries by collection, date, priority
2. **Incremental Sync**: Only fetch changes
3. **Batch Operations**: Group multiple updates
4. **Lazy Loading**: Load collections on demand
5. **Connection Pooling**: Reuse Socket.io connections

## Next Steps

- [Data Model Details](./05-data-model.md)
- [Permission System](./06-permissions.md)
- [Sync Strategy](./07-sync-strategy.md)
