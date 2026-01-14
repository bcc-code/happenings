/**
 * IndexedDB storage layer for client-side data persistence
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type {
  SyncDocument,
  DeletionRecord,
  RetentionPriority,
  StorageStats,
} from '../types';

interface DataSyncDB extends DBSchema {
  documents: {
    key: [string, string]; // [collection, id]
    value: SyncDocument;
    indexes: {
      collection: string;
      expiresAt: number;
      lastModified: number;
      priority: RetentionPriority;
    };
  };
  deletions: {
    key: [string, string]; // [collection, id]
    value: DeletionRecord;
    indexes: {
      collection: string;
      deletedAt: number;
    };
  };
  metadata: {
    key: string;
    value: {
      key: string;
      value: unknown;
    };
  };
}

export class SyncStorage {
  private db: IDBPDatabase<DataSyncDB> | null = null;
  private dbName: string;
  private maxSize: number;

  constructor(dbName: string = 'data-sync', maxSize: number = 50 * 1024 * 1024) {
    this.dbName = dbName;
    this.maxSize = maxSize;
  }

  async init(): Promise<void> {
    this.db = await openDB<DataSyncDB>(this.dbName, 1, {
      upgrade(db) {
        // Documents store
        const documentStore = db.createObjectStore('documents', {
          keyPath: ['collection', 'id'],
        });
        documentStore.createIndex('collection', 'collection');
        documentStore.createIndex('expiresAt', 'metadata.expiresAt');
        documentStore.createIndex('lastModified', 'metadata.lastModified');
        documentStore.createIndex('priority', 'metadata.retentionPriority');

        // Deletions store
        const deletionStore = db.createObjectStore('deletions', {
          keyPath: ['collection', 'id'],
        });
        deletionStore.createIndex('collection', 'collection');
        deletionStore.createIndex('deletedAt', 'deletedAt');

        // Metadata store
        db.createObjectStore('metadata');
      },
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Store a document
   */
  async putDocument(document: SyncDocument): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized');

    // Check storage size and cleanup if needed
    await this.ensureStorageSpace();

    await this.db.put('documents', document);

    // Remove from deletions if it exists
    await this.db.delete('deletions', [document.collection, document.id]);
  }

  /**
   * Get a document by ID
   */
  async getDocument(collection: string, id: string): Promise<SyncDocument | undefined> {
    if (!this.db) throw new Error('Storage not initialized');
    return await this.db.get('documents', [collection, id]);
  }

  /**
   * Get all documents in a collection
   */
  async getDocuments(collection: string): Promise<SyncDocument[]> {
    if (!this.db) throw new Error('Storage not initialized');

    const index = this.db.transaction('documents').store.index('collection');
    const documents: SyncDocument[] = [];

    let cursor = await index.openCursor(IDBKeyRange.only(collection));
    while (cursor) {
      documents.push(cursor.value);
      cursor = await cursor.continue();
    }

    return documents;
  }

  /**
   * Delete a document (store as deletion record)
   */
  async deleteDocument(
    collection: string,
    id: string,
    deletedBy: string,
    version: number
  ): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized');

    // Remove from documents
    await this.db.delete('documents', [collection, id]);

    // Store deletion record
    const deletion: DeletionRecord = {
      id,
      collection,
      deletedAt: new Date(),
      deletedBy,
      version,
    };
    await this.db.put('deletions', deletion);
  }

  /**
   * Get deletion records for a collection
   */
  async getDeletions(collection: string, since?: Date): Promise<DeletionRecord[]> {
    if (!this.db) throw new Error('Storage not initialized');

    const index = this.db.transaction('deletions').store.index('collection');
    const deletions: DeletionRecord[] = [];

    let cursor = await index.openCursor(IDBKeyRange.only(collection));
    while (cursor) {
      if (!since || cursor.value.deletedAt >= since) {
        deletions.push(cursor.value);
      }
      cursor = await cursor.continue();
    }

    return deletions;
  }

  /**
   * Get documents modified since a date
   */
  async getDocumentsSince(collection: string, since: Date): Promise<SyncDocument[]> {
    if (!this.db) throw new Error('Storage not initialized');

    const index = this.db.transaction('documents').store.index('lastModified');
    const documents: SyncDocument[] = [];

    let cursor = await index.openCursor(
      IDBKeyRange.lowerBound(since.getTime(), true)
    );
    while (cursor) {
      if (cursor.value.collection === collection) {
        documents.push(cursor.value);
      }
      cursor = await cursor.continue();
    }

    return documents;
  }

  /**
   * Clean up expired documents
   */
  async cleanupExpired(): Promise<number> {
    if (!this.db) throw new Error('Storage not initialized');

    const index = this.db.transaction('documents').store.index('expiresAt');
    const now = Date.now();
    let deleted = 0;

    let cursor = await index.openCursor(IDBKeyRange.upperBound(now));
    while (cursor) {
      await cursor.delete();
      deleted++;
      cursor = await cursor.continue();
    }

    return deleted;
  }

  /**
   * Ensure storage space by removing lowest priority documents
   */
  async ensureStorageSpace(): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized');

    const stats = await this.getStats();
    if (stats.totalSize < this.maxSize) {
      return;
    }

    // Get all documents sorted by priority (lowest first) and lastModified (oldest first)
    const tx = this.db.transaction('documents', 'readwrite');
    const store = tx.store;
    const priorityIndex = store.index('priority');
    const lastModifiedIndex = store.index('lastModified');

    const documents: Array<{ collection: string; id: string; priority: RetentionPriority; lastModified: number }> =
      [];

    let cursor = await priorityIndex.openCursor();
    while (cursor) {
      documents.push({
        collection: cursor.value.collection,
        id: cursor.value.id,
        priority: cursor.value.metadata.retentionPriority,
        lastModified: cursor.value.metadata.lastModified.getTime(),
      });
      cursor = await cursor.continue();
    }

    // Sort by priority (ascending) then lastModified (ascending)
    documents.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.lastModified - b.lastModified;
    });

    // Remove oldest, lowest priority documents until we have space
    let currentSize = stats.totalSize;
    for (const doc of documents) {
      if (currentSize < this.maxSize * 0.8) {
        // Keep 20% buffer
        break;
      }

      await tx.store.delete([doc.collection, doc.id]);
      currentSize -= 1024; // Rough estimate per document
    }

    await tx.done;
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    if (!this.db) throw new Error('Storage not initialized');

    const tx = this.db.transaction('documents', 'readonly');
    const store = tx.store;
    const collections = new Set<string>();
    let count = 0;
    let oldestDate: Date | undefined;
    let newestDate: Date | undefined;

    let cursor = await store.openCursor();
    while (cursor) {
      count++;
      collections.add(cursor.value.collection);

      const modified = cursor.value.metadata.lastModified;
      if (!oldestDate || modified < oldestDate) {
        oldestDate = modified;
      }
      if (!newestDate || modified > newestDate) {
        newestDate = modified;
      }

      cursor = await cursor.continue();
    }

    // Estimate size (rough calculation)
    const totalSize = count * 1024; // Rough estimate

    return {
      totalSize,
      documentCount: count,
      collectionCount: collections.size,
      oldestDocument: oldestDate,
      newestDocument: newestDate,
    };
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized');

    const tx = this.db.transaction(['documents', 'deletions', 'metadata'], 'readwrite');
    await tx.objectStore('documents').clear();
    await tx.objectStore('deletions').clear();
    await tx.objectStore('metadata').clear();
    await tx.done;
  }

  /**
   * Get metadata value
   */
  async getMetadata(key: string): Promise<unknown | undefined> {
    if (!this.db) throw new Error('Storage not initialized');
    const metadata = await this.db.get('metadata', key);
    return metadata?.value;
  }

  /**
   * Set metadata value
   */
  async setMetadata(key: string, value: unknown): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized');
    await this.db.put('metadata', { key, value });
  }
}
