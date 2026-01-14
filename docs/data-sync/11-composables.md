# Vue Composables Reference

Vue 3 composables for easy integration with the data sync system.

## useSync

Main composable for managing the sync client.

### Usage

```typescript
import { useSync } from '@bcc-events/data-sync/composables';

const sync = useSync({
  apiUrl: 'https://api.example.com',
  socketUrl: 'https://api.example.com',
  authToken: 'token',
});

await sync.init();
```

### API

#### Properties

- `client: ComputedRef<SyncClient | null>` - Sync client instance
- `isInitialized: Ref<boolean>` - Initialization status
- `error: Ref<Error | null>` - Current error
- `state: ComputedRef<SyncState | null>` - Current sync state

#### Methods

- `init(): Promise<void>` - Initialize sync client
- `subscribe(collection, options)` - Subscribe to collection
- `getDocuments(collection)` - Get documents from storage
- `getDocument(collection, id)` - Get single document
- `syncCollection(collection, since?)` - Sync collection
- `syncAll()` - Sync all collections
- `getStorageStats()` - Get storage statistics
- `disconnect()` - Disconnect and cleanup

### Example

```vue
<script setup lang="ts">
import { useSync } from '@bcc-events/data-sync/composables';

const sync = useSync({
  apiUrl: useRuntimeConfig().public.apiUrl,
  socketUrl: useRuntimeConfig().public.apiUrl,
  authToken: await getAccessToken(),
});

onMounted(async () => {
  await sync.init();
});

onUnmounted(() => {
  sync.disconnect();
});
</script>
```

---

## useSyncCollection

Composable for subscribing to a specific collection with reactive state.

### Usage

```typescript
import { useSyncCollection } from '@bcc-events/data-sync/composables';

const { documents, isLoading, error, start, stop, refresh } = useSyncCollection(
  syncClient,
  'events'
);
```

### API

#### Properties

- `documents: Ref<SyncDocument[]>` - Reactive array of documents
- `isLoading: Ref<boolean>` - Loading state
- `error: Ref<Error | null>` - Current error

#### Methods

- `start()` - Start subscription and load data
- `stop()` - Stop subscription
- `refresh()` - Refresh data from server

### Example

```vue
<script setup lang="ts">
import { useSync, useSyncCollection } from '@bcc-events/data-sync/composables';

const sync = useSync(config);
await sync.init();

const { documents, isLoading, error, start, refresh } = useSyncCollection(
  sync.client,
  'events'
);

onMounted(() => {
  start();
});

// Refresh every minute
const refreshInterval = setInterval(() => {
  refresh();
}, 60000);

onUnmounted(() => {
  clearInterval(refreshInterval);
});
</script>

<template>
  <div v-if="isLoading">Loading events...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <div v-for="event in documents" :key="event.id">
      <h3>{{ event.data.title }}</h3>
      <p>{{ event.data.description }}</p>
    </div>
  </div>
</template>
```

---

## Advanced Patterns

### Multiple Collections

```vue
<script setup lang="ts">
const events = useSyncCollection(sync.client, 'events');
const registrations = useSyncCollection(sync.client, 'registrations');
const users = useSyncCollection(sync.client, 'users');

onMounted(() => {
  events.start();
  registrations.start();
  users.start();
});
</script>
```

### Conditional Subscription

```vue
<script setup lang="ts">
const showEvents = ref(true);
const events = useSyncCollection(sync.client, 'events');

watch(showEvents, (value) => {
  if (value) {
    events.start();
  } else {
    events.stop();
  }
});
</script>
```

### Error Handling

```vue
<script setup lang="ts">
const { documents, error, start } = useSyncCollection(
  sync.client,
  'events'
);

watch(error, (err) => {
  if (err) {
    // Show error notification
    showNotification({
      type: 'error',
      message: `Sync error: ${err.message}`,
    });
  }
});

onMounted(() => {
  start();
});
</script>
```

### Manual Sync

```vue
<script setup lang="ts">
const sync = useSync(config);
await sync.init();

const { documents, refresh } = useSyncCollection(sync.client, 'events');

// Manual refresh button
async function handleRefresh() {
  await refresh();
  showNotification({ message: 'Events refreshed' });
}
</script>

<template>
  <button @click="handleRefresh">Refresh Events</button>
  <div v-for="event in documents" :key="event.id">
    {{ event.data.title }}
  </div>
</template>
```

### State Monitoring

```vue
<script setup lang="ts">
const sync = useSync(config);
await sync.init();

const state = computed(() => sync.state.value);

watch(state, (newState) => {
  if (newState) {
    console.log('Status:', newState.status);
    console.log('Last sync:', newState.lastSync);
    console.log('Collections:', newState.collections);
  }
});
</script>

<template>
  <div v-if="state">
    <p>Status: {{ state.status }}</p>
    <p v-if="state.lastSync">
      Last sync: {{ state.lastSync.toLocaleString() }}
    </p>
  </div>
</template>
```

## Nuxt 3 Plugin Example

```typescript
// plugins/data-sync.client.ts
import { useSync } from '@bcc-events/data-sync/composables';
import { useAuth0 } from '@auth0/auth0-vue';

export default defineNuxtPlugin(async () => {
  const { getAccessTokenSilently } = useAuth0();
  const config = useRuntimeConfig();

  const sync = useSync({
    apiUrl: config.public.apiUrl,
    socketUrl: config.public.apiUrl,
    authToken: await getAccessTokenSilently(),
  });

  await sync.init();

  return {
    provide: {
      sync,
    },
  };
});
```

## Best Practices

1. **Initialize Once**: Initialize sync client in plugin or root component
2. **Cleanup**: Always call `disconnect()` on unmount
3. **Error Handling**: Watch for errors and handle gracefully
4. **Loading States**: Show loading indicators during sync
5. **Reactive Updates**: Use composables for reactive document updates
6. **Memory Management**: Stop subscriptions when not needed

## Next Steps

- [Client API Reference](./08-client-api.md)
- [Quick Start Guide](./02-quick-start.md)
- [Integration Examples](./examples/03-integration.md)
