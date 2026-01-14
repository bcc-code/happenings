# Offline Support - Requirements & Planning

## Overview

The offline support system enables the end user app to function without internet connectivity, critical for users in areas with poor connectivity (especially Africa). The app should support offline viewing and queue actions for sync when connectivity is restored.

## Status: Planning Phase

**Last Updated:** [Date]
**Status:** Requirements gathering

---

## Core Requirements

### Offline Capabilities

- [ ] **Viewing (Offline)**
  - View cached event details
  - View cached program schedules
  - View cached session information
  - View cached speaker profiles
  - View cached resources (downloaded)
  - View cached announcements
  - View personal schedule
  - View registration history

- [ ] **Actions (Queued for Sync)**
  - Event registration
  - Session registration
  - Meal selection
  - Resource downloads
  - Profile updates
  - Message sending

### Sync Strategy

- [ ] **Background Sync**
  - Automatic sync when online
  - Manual sync trigger
  - Conflict resolution
  - Sync status indicators

- [ ] **Data Management**
  - Cache size limits
  - Cache expiration
  - Selective cache clearing
  - Storage quota management

## Technology Stack

### Service Workers
- Network interception
- Cache management
- Background sync
- Push notifications

### IndexedDB
- Structured data storage
- Offline data access
- Query capabilities
- Transaction support

### Cache API
- Static asset caching
- API response caching
- Image caching
- Resource caching

## Implementation Strategy

### Service Worker Architecture

```javascript
// Service worker structure
- Install: Cache static assets
- Activate: Clean old caches
- Fetch: Intercept network requests
- Sync: Background sync for queued actions
- Message: Communication with app
```

### Data Caching Strategy

**Tier 1: Critical Data (Always Cached)**
- User profile
- Active event details
- Program schedule
- Personal schedule
- Registration status

**Tier 2: Important Data (Cached on View)**
- Session details
- Speaker profiles
- Announcements
- Resources (on download)

**Tier 3: Optional Data (Cached on Demand)**
- Historical events
- Old announcements
- Archived resources

## Database Schema (Planned)

### Offline Storage (IndexedDB)

```typescript
// Stores structure
interface OfflineStores {
  events: Event[];
  sessions: Session[];
  speakers: Speaker[];
  resources: Resource[];
  announcements: Announcement[];
  registrations: Registration[];
  mealSelections: MealSelection[];
  syncQueue: SyncAction[];
  cacheMetadata: CacheMetadata[];
}
```

### Sync Queue

```typescript
interface SyncAction {
  id: string;
  type: 'register' | 'unregister' | 'select-meal' | 'update-profile' | ...;
  entityType: string;
  entityId: string;
  action: any; // Action payload
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
  createdAt: Date;
  syncedAt?: Date;
  error?: string;
}
```

## API Endpoints (Planned)

### Sync Endpoints
- `POST /api/sync` - Sync queued actions
- `GET /api/sync/status` - Get sync status
- `POST /api/sync/resolve-conflict` - Resolve sync conflicts

### Cache Endpoints
- `GET /api/events/:id?include=cache` - Get event with cache metadata
- `GET /api/sessions?eventId=:id&include=cache` - Get sessions with cache info

## UI Components (Planned)

### Offline Indicators
- Connection status indicator
- Sync status indicator
- Queued actions count
- Last sync time

### Offline Features
- Offline mode toggle
- Manual sync button
- Cache management UI
- Storage usage display

## Sync Scenarios

### Registration Sync

1. User registers offline → Queued
2. User comes online → Sync triggered
3. Conflict: Event full → User notified
4. Resolution: Offer waitlist or alternative

### Session Registration Sync

1. User selects session offline → Queued
2. Sync when online
3. Conflict: Session full → Handle waitlist
4. Update local cache

### Profile Update Sync

1. User updates profile offline → Queued
2. Sync when online
3. Conflict: Email already exists → User notified
4. Resolution: User chooses action

## Conflict Resolution

### Conflict Types

- **Data Changed**: Server data differs from local
- **Resource Unavailable**: Event/session full
- **Validation Error**: Invalid data
- **Permission Error**: Access denied

### Resolution Strategies

- **Last Write Wins**: For non-critical data
- **User Decision**: Present options to user
- **Automatic**: Apply business rules
- **Merge**: Combine changes when possible

## Cache Management

### Cache Invalidation

- Time-based expiration
- Version-based invalidation
- Event-based invalidation (on updates)
- Manual invalidation

### Cache Size Limits

- Per-store size limits
- Total storage quota
- LRU eviction policy
- User-configurable limits

## Performance Considerations

- [ ] Lazy loading of cached data
- [ ] Incremental sync (only changed data)
- [ ] Compression of cached data
- [ ] Efficient IndexedDB queries
- [ ] Background sync optimization

## Testing Strategy

- [ ] Offline mode testing
- [ ] Sync conflict testing
- [ ] Cache expiration testing
- [ ] Storage quota testing
- [ ] Network condition simulation
- [ ] Cross-browser testing

## User Experience

### Offline Indicators

- Clear visual indicators when offline
- Show queued actions
- Sync progress feedback
- Error notifications

### Graceful Degradation

- Show cached data immediately
- Indicate data freshness
- Allow queuing actions
- Provide sync status

## Integration Points

- **All Modules**: Cache module-specific data
- **Communication Module**: Queue messages for sync
- **Finance Module**: Queue payments (handle carefully)
- **Resources Module**: Download resources for offline

## Open Questions

- [ ] How to handle payment processing offline? (Should be online-only)
- [ ] How long should cached data be valid?
- [ ] Should there be a maximum queue size?
- [ ] How to handle large resource downloads?
- [ ] Should sync be automatic or manual?
- [ ] How to handle partial sync failures?
- [ ] Should there be offline analytics?

## Notes

_Add implementation notes, decisions, and updates here as development progresses._
