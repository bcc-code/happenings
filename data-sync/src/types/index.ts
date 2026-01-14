/**
 * Core types for data synchronization engine
 */

/**
 * Retention priority levels
 * Lower numbers = higher priority (will be kept longer)
 */
export enum RetentionPriority {
  CRITICAL = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
  TEMPORARY = 5,
}

/**
 * Permission actions
 */
export enum PermissionAction {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
}

/**
 * Permission scope - where the permission applies
 */
export enum PermissionScope {
  COLLECTION = 'collection',
  ITEM = 'item',
}

/**
 * Permission definition
 * Microsoft-style: users/groups -> collections/items
 */
export interface Permission {
  id: string;
  userId?: string; // If set, applies to specific user
  groupId?: string; // If set, applies to all users in group
  collection: string; // Collection name
  itemId?: string; // If set, applies to specific item; if not, applies to entire collection
  actions: PermissionAction[]; // Allowed actions
  scope: PermissionScope;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sync document metadata
 */
export interface SyncMetadata {
  version: number; // Incremented on each update
  lastModified: Date;
  lastSynced?: Date; // Last time synced with server
  expiresAt?: Date; // Optional expiration date
  retentionPriority: RetentionPriority;
  deletedAt?: Date; // If set, document is deleted (tombstone)
  deletedBy?: string; // User who deleted the document
}

/**
 * Base sync document structure
 */
export interface SyncDocument<T = Record<string, unknown>> {
  id: string;
  collection: string;
  data: T;
  metadata: SyncMetadata;
}

/**
 * Deletion record (tombstone)
 */
export interface DeletionRecord {
  id: string;
  collection: string;
  deletedAt: Date;
  deletedBy: string;
  version: number; // Version at time of deletion
}

/**
 * Sync event types
 */
export enum SyncEventType {
  DOCUMENT_CREATED = 'document:created',
  DOCUMENT_UPDATED = 'document:updated',
  DOCUMENT_DELETED = 'document:deleted',
  COLLECTION_CLEARED = 'collection:cleared',
  SYNC_COMPLETE = 'sync:complete',
  SYNC_ERROR = 'sync:error',
}

/**
 * Sync event payload
 */
export interface SyncEvent {
  type: SyncEventType;
  collection: string;
  documentId?: string;
  document?: SyncDocument;
  timestamp: Date;
}

/**
 * Sync request for fetching data
 */
export interface SyncRequest {
  collection: string;
  since?: Date; // Only fetch changes since this date
  limit?: number;
  offset?: number;
}

/**
 * Sync response
 */
export interface SyncResponse {
  collection: string;
  documents: SyncDocument[];
  deletions: DeletionRecord[];
  hasMore: boolean;
  syncToken?: string; // Token for next sync
}

/**
 * Client configuration
 */
export interface SyncClientConfig {
  apiUrl: string;
  socketUrl: string;
  authToken: string;
  dbName?: string; // IndexedDB database name
  maxStorageSize?: number; // Max storage in bytes (default: 50MB)
  syncInterval?: number; // Auto-sync interval in ms (default: 30000)
  reconnectDelay?: number; // Delay before reconnecting in ms (default: 1000)
}

/**
 * Server configuration
 */
export interface SyncServerConfig {
  port?: number;
  cors?: {
    origin: string | string[];
    credentials: boolean;
  };
}

/**
 * Collection subscription options
 */
export interface SubscriptionOptions {
  onUpdate?: (documents: SyncDocument[]) => void;
  onDelete?: (ids: string[]) => void;
  onError?: (error: Error) => void;
  filters?: Record<string, unknown>; // Optional filters
}

/**
 * Storage statistics
 */
export interface StorageStats {
  totalSize: number;
  documentCount: number;
  collectionCount: number;
  oldestDocument?: Date;
  newestDocument?: Date;
}

/**
 * Sync status
 */
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  OFFLINE = 'offline',
  ERROR = 'error',
}

export interface SyncState {
  status: SyncStatus;
  lastSync?: Date;
  error?: Error;
  collections: string[];
}
