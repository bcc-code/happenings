/**
 * Vue composable for data synchronization
 */

import { ref, computed, onUnmounted, type Ref } from 'vue';
import type {
  SyncClient,
  SyncDocument,
  SubscriptionOptions,
  SyncState,
  StorageStats,
  SyncClientConfig,
} from '../client';
import { createSyncClient } from '../client';

export function useSync(config: SyncClientConfig) {
  const client = ref<SyncClient | null>(null);
  const isInitialized = ref(false);
  const error = ref<Error | null>(null);

  /**
   * Initialize the sync client
   */
  async function init() {
    try {
      const syncClient = createSyncClient(config);
      await syncClient.init();
      client.value = syncClient;
      isInitialized.value = true;
      error.value = null;
    } catch (err) {
      error.value = err as Error;
      throw err;
    }
  }

  /**
   * Subscribe to a collection
   */
  function subscribe(
    collection: string,
    options: SubscriptionOptions
  ): () => void {
    if (!client.value) {
      throw new Error('Sync client not initialized');
    }

    return client.value.subscribe(collection, options);
  }

  /**
   * Get documents from local storage
   */
  async function getDocuments(collection: string): Promise<SyncDocument[]> {
    if (!client.value) {
      throw new Error('Sync client not initialized');
    }

    return await client.value.getDocuments(collection);
  }

  /**
   * Get a single document
   */
  async function getDocument(
    collection: string,
    id: string
  ): Promise<SyncDocument | undefined> {
    if (!client.value) {
      throw new Error('Sync client not initialized');
    }

    return await client.value.getDocument(collection, id);
  }

  /**
   * Sync a collection
   */
  async function syncCollection(collection: string, since?: Date): Promise<void> {
    if (!client.value) {
      throw new Error('Sync client not initialized');
    }

    await client.value.syncCollection(collection, since);
  }

  /**
   * Sync all collections
   */
  async function syncAll(): Promise<void> {
    if (!client.value) {
      throw new Error('Sync client not initialized');
    }

    await client.value.syncAll();
  }

  /**
   * Get sync state
   */
  const state = computed<SyncState | null>(() => {
    if (!client.value) return null;
    return client.value.getState();
  });

  /**
   * Get storage statistics
   */
  async function getStorageStats(): Promise<StorageStats> {
    if (!client.value) {
      throw new Error('Sync client not initialized');
    }

    return await client.value.getStorageStats();
  }

  /**
   * Disconnect and cleanup
   */
  async function disconnect() {
    if (client.value) {
      await client.value.disconnect();
      client.value = null;
      isInitialized.value = false;
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect();
  });

  return {
    client: computed(() => client.value),
    isInitialized,
    error,
    state,
    init,
    subscribe,
    getDocuments,
    getDocument,
    syncCollection,
    syncAll,
    getStorageStats,
    disconnect,
  };
}

/**
 * Composable for subscribing to a specific collection
 */
export function useSyncCollection(
  syncClient: Ref<SyncClient | null>,
  collection: string,
  options: Omit<SubscriptionOptions, 'onUpdate' | 'onDelete' | 'onError'> = {}
) {
  const documents = ref<SyncDocument[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  let unsubscribe: (() => void) | null = null;

  const subscriptionOptions: SubscriptionOptions = {
    ...options,
    onUpdate: (updatedDocs) => {
      // Merge updates with existing documents
      updatedDocs.forEach((doc) => {
        const index = documents.value.findIndex((d) => d.id === doc.id);
        if (index >= 0) {
          documents.value[index] = doc;
        } else {
          documents.value.push(doc);
        }
      });
    },
    onDelete: (ids) => {
      documents.value = documents.value.filter((doc) => !ids.includes(doc.id));
    },
    onError: (err) => {
      error.value = err;
    },
  };

  /**
   * Start subscription
   */
  async function start() {
    if (!syncClient.value) {
      throw new Error('Sync client not initialized');
    }

    isLoading.value = true;
    try {
      // Load existing documents
      documents.value = await syncClient.value.getDocuments(collection);

      // Subscribe to updates
      unsubscribe = syncClient.value.subscribe(collection, subscriptionOptions);

      // Initial sync
      await syncClient.value.syncCollection(collection);
    } catch (err) {
      error.value = err as Error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Stop subscription
   */
  function stop() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  /**
   * Refresh data
   */
  async function refresh() {
    if (!syncClient.value) {
      throw new Error('Sync client not initialized');
    }

    isLoading.value = true;
    try {
      await syncClient.value.syncCollection(collection);
      documents.value = await syncClient.value.getDocuments(collection);
    } catch (err) {
      error.value = err as Error;
    } finally {
      isLoading.value = false;
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stop();
  });

  return {
    documents,
    isLoading,
    error,
    start,
    stop,
    refresh,
  };
}
