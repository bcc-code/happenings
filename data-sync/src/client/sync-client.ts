/**
 * Main sync client for handling data synchronization
 */

import { io, Socket } from 'socket.io-client';
import type {
  SyncClientConfig,
  SyncDocument,
  SyncRequest,
  SyncResponse,
  SubscriptionOptions,
  SyncStatus,
  SyncState,
  DeletionRecord,
  SyncEvent,
  SyncEventType,
} from '../types';
import { SyncStorage } from './storage';

export class SyncClient {
  private config: SyncClientConfig;
  private storage: SyncStorage;
  private socket: Socket | null = null;
  private status: SyncStatus = SyncStatus.IDLE;
  private subscriptions: Map<string, Set<SubscriptionOptions>> = new Map();
  private syncInterval: number | null = null;
  private lastSyncTime: Date | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor(config: SyncClientConfig) {
    this.config = {
      dbName: 'data-sync',
      maxStorageSize: 50 * 1024 * 1024,
      syncInterval: 30000,
      reconnectDelay: 1000,
      ...config,
    };
    this.storage = new SyncStorage(this.config.dbName, this.config.maxStorageSize);
  }

  /**
   * Initialize the sync client
   */
  async init(): Promise<void> {
    await this.storage.init();
    await this.connectSocket();
    await this.startAutoSync();
    await this.cleanupExpired();
  }

  /**
   * Connect to Socket.io server
   */
  private async connectSocket(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.config.socketUrl, {
      auth: {
        token: this.config.authToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.config.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      this.status = SyncStatus.IDLE;
      this.reconnectAttempts = 0;
      this.onReconnect();
    });

    this.socket.on('disconnect', () => {
      this.status = SyncStatus.OFFLINE;
    });

    this.socket.on('connect_error', (error) => {
      this.status = SyncStatus.ERROR;
      console.error('Socket connection error:', error);
    });

    // Listen for sync events
    this.socket.on('sync:event', (event: SyncEvent) => {
      this.handleSyncEvent(event);
    });

    // Subscribe to collections
    this.subscriptions.forEach((_, collection) => {
      this.socket?.emit('subscribe', collection);
    });
  }

  /**
   * Handle reconnection - sync changes since last online
   */
  private async onReconnect(): Promise<void> {
    if (!this.lastSyncTime) {
      // First sync - fetch all
      await this.syncAll();
    } else {
      // Incremental sync - only changes since last sync
      await this.syncSince(this.lastSyncTime);
    }
  }

  /**
   * Handle incoming sync events from server
   */
  private async handleSyncEvent(event: SyncEvent): Promise<void> {
    switch (event.type) {
      case SyncEventType.DOCUMENT_CREATED:
      case SyncEventType.DOCUMENT_UPDATED:
        if (event.document) {
          await this.storage.putDocument(event.document);
          this.notifySubscribers(event.collection, 'update', [event.document]);
        }
        break;

      case SyncEventType.DOCUMENT_DELETED:
        if (event.documentId) {
          // The deletion record should be in the event
          const deletion: DeletionRecord = {
            id: event.documentId,
            collection: event.collection,
            deletedAt: event.timestamp,
            deletedBy: 'system', // Will be set by server
            version: 0, // Will be set by server
          };
          await this.storage.deleteDocument(
            event.collection,
            event.documentId,
            deletion.deletedBy,
            deletion.version
          );
          this.notifySubscribers(event.collection, 'delete', [event.documentId]);
        }
        break;

      case SyncEventType.COLLECTION_CLEARED:
        // Handle collection clear if needed
        break;
    }
  }

  /**
   * Notify subscribers of changes
   */
  private notifySubscribers(
    collection: string,
    type: 'update' | 'delete',
    data: SyncDocument[] | string[]
  ): void {
    const subs = this.subscriptions.get(collection);
    if (!subs) return;

    subs.forEach((options) => {
      try {
        if (type === 'update' && options.onUpdate) {
          options.onUpdate(data as SyncDocument[]);
        } else if (type === 'delete' && options.onDelete) {
          options.onDelete(data as string[]);
        }
      } catch (error) {
        if (options.onError) {
          options.onError(error as Error);
        }
      }
    });
  }

  /**
   * Subscribe to a collection
   */
  subscribe(collection: string, options: SubscriptionOptions): () => void {
    if (!this.subscriptions.has(collection)) {
      this.subscriptions.set(collection, new Set());
    }

    this.subscriptions.get(collection)!.add(options);

    // Subscribe to socket events
    if (this.socket?.connected) {
      this.socket.emit('subscribe', collection);
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(collection);
      if (subs) {
        subs.delete(options);
        if (subs.size === 0) {
          this.subscriptions.delete(collection);
          if (this.socket?.connected) {
            this.socket.emit('unsubscribe', collection);
          }
        }
      }
    };
  }

  /**
   * Sync a specific collection
   */
  async syncCollection(collection: string, since?: Date): Promise<void> {
    this.status = SyncStatus.SYNCING;

    try {
      const request: SyncRequest = {
        collection,
        since,
      };

      const response = await this.fetchSync(request);

      // Store documents
      for (const doc of response.documents) {
        await this.storage.putDocument(doc);
      }

      // Store deletions
      for (const deletion of response.deletions) {
        await this.storage.deleteDocument(
          deletion.collection,
          deletion.id,
          deletion.deletedBy,
          deletion.version
        );
      }

      // Notify subscribers
      if (response.documents.length > 0) {
        this.notifySubscribers(collection, 'update', response.documents);
      }
      if (response.deletions.length > 0) {
        this.notifySubscribers(
          collection,
          'delete',
          response.deletions.map((d) => d.id)
        );
      }

      this.lastSyncTime = new Date();
      this.status = SyncStatus.IDLE;
    } catch (error) {
      this.status = SyncStatus.ERROR;
      throw error;
    }
  }

  /**
   * Sync all subscribed collections
   */
  async syncAll(): Promise<void> {
    const collections = Array.from(this.subscriptions.keys());
    await Promise.all(collections.map((col) => this.syncCollection(col)));
  }

  /**
   * Sync changes since a specific date
   */
  async syncSince(since: Date): Promise<void> {
    const collections = Array.from(this.subscriptions.keys());
    await Promise.all(collections.map((col) => this.syncCollection(col, since)));
  }

  /**
   * Fetch sync data from server
   */
  private async fetchSync(request: SyncRequest): Promise<SyncResponse> {
    const url = new URL(`${this.config.apiUrl}/api/sync`);
    url.searchParams.set('collection', request.collection);
    if (request.since) {
      url.searchParams.set('since', request.since.toISOString());
    }
    if (request.limit) {
      url.searchParams.set('limit', request.limit.toString());
    }
    if (request.offset) {
      url.searchParams.set('offset', request.offset.toString());
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.config.authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Sync request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Start automatic sync interval
   */
  private async startAutoSync(): Promise<void> {
    if (this.syncInterval) {
      return;
    }

    if (this.config.syncInterval) {
      this.syncInterval = (typeof window !== 'undefined' ? window : globalThis).setInterval(() => {
        if (this.status === SyncStatus.IDLE && (typeof navigator !== 'undefined' ? navigator.onLine : true)) {
          this.syncAll().catch((error) => {
            console.error('Auto-sync error:', error);
          });
        }
      }, this.config.syncInterval) as unknown as number;
    }
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Clean up expired documents
   */
  private async cleanupExpired(): Promise<void> {
    await this.storage.cleanupExpired();
  }

  /**
   * Get documents from local storage
   */
  async getDocuments(collection: string): Promise<SyncDocument[]> {
    return await this.storage.getDocuments(collection);
  }

  /**
   * Get a single document
   */
  async getDocument(collection: string, id: string): Promise<SyncDocument | undefined> {
    return await this.storage.getDocument(collection, id);
  }

  /**
   * Get current sync state
   */
  getState(): SyncState {
    return {
      status: this.status,
      lastSync: this.lastSyncTime || undefined,
      collections: Array.from(this.subscriptions.keys()),
    };
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    return await this.storage.getStats();
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    this.stopAutoSync();

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    await this.storage.close();
    this.status = SyncStatus.IDLE;
  }
}

/**
 * Create a new sync client instance
 */
export function createSyncClient(config: SyncClientConfig): SyncClient {
  return new SyncClient(config);
}
