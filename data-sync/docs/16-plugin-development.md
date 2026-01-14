# Plugin Development

## Overview

Guide for creating custom plugins and extensions for the data sync system.

## Plugin Architecture

### Plugin Interface

```typescript
interface SyncPlugin {
  name: string;
  version: string;
  
  // Lifecycle hooks
  onInit?(client: SyncClient): void | Promise<void>;
  onSync?(collection: string, documents: SyncDocument[]): void | Promise<void>;
  onUpdate?(document: SyncDocument): void | Promise<void>;
  onDelete?(collection: string, id: string): void | Promise<void>;
  onError?(error: Error): void | Promise<void>;
  
  // Cleanup
  onDisconnect?(): void | Promise<void>;
}
```

## Creating a Plugin

### Basic Plugin Structure

```typescript
// plugins/analytics-plugin.ts
import type { SyncPlugin, SyncClient, SyncDocument } from '@bcc-events/data-sync';

export class AnalyticsPlugin implements SyncPlugin {
  name = 'analytics';
  version = '1.0.0';
  
  private eventCount = 0;
  
  onInit(client: SyncClient) {
    console.log('Analytics plugin initialized');
  }
  
  onSync(collection: string, documents: SyncDocument[]) {
    this.eventCount += documents.length;
    console.log(`Synced ${documents.length} documents from ${collection}`);
  }
  
  onUpdate(document: SyncDocument) {
    this.trackEvent('document_updated', {
      collection: document.collection,
      id: document.id,
    });
  }
  
  onDelete(collection: string, id: string) {
    this.trackEvent('document_deleted', { collection, id });
  }
  
  private trackEvent(event: string, data: Record<string, unknown>) {
    // Send to analytics service
    analytics.track(event, data);
  }
}
```

### Using a Plugin

```typescript
import { createSyncClient } from '@bcc-events/data-sync/client';
import { AnalyticsPlugin } from './plugins/analytics-plugin';

const client = createSyncClient(config);

// Register plugin
client.registerPlugin(new AnalyticsPlugin());

await client.init();
```

## Plugin Examples

### 1. Logging Plugin

```typescript
export class LoggingPlugin implements SyncPlugin {
  name = 'logging';
  version = '1.0.0';
  
  onSync(collection: string, documents: SyncDocument[]) {
    console.log(`[Sync] ${collection}: ${documents.length} documents`);
  }
  
  onUpdate(document: SyncDocument) {
    console.log(`[Update] ${document.collection}/${document.id}`);
  }
  
  onError(error: Error) {
    console.error(`[Error] ${error.message}`, error);
  }
}
```

### 2. Cache Plugin

```typescript
export class CachePlugin implements SyncPlugin {
  name = 'cache';
  version = '1.0.0';
  
  private cache = new Map<string, SyncDocument>();
  
  onUpdate(document: SyncDocument) {
    const key = `${document.collection}:${document.id}`;
    this.cache.set(key, document);
  }
  
  onDelete(collection: string, id: string) {
    const key = `${collection}:${id}`;
    this.cache.delete(key);
  }
  
  get(collection: string, id: string): SyncDocument | undefined {
    return this.cache.get(`${collection}:${id}`);
  }
}
```

### 3. Validation Plugin

```typescript
export class ValidationPlugin implements SyncPlugin {
  name = 'validation';
  version = '1.0.0';
  
  private schemas = new Map<string, ZodSchema>();
  
  registerSchema(collection: string, schema: ZodSchema) {
    this.schemas.set(collection, schema);
  }
  
  onUpdate(document: SyncDocument) {
    const schema = this.schemas.get(document.collection);
    if (schema) {
      const result = schema.safeParse(document.data);
      if (!result.success) {
        throw new Error(`Validation failed: ${result.error.message}`);
      }
    }
  }
}
```

### 4. Transform Plugin

```typescript
export class TransformPlugin implements SyncPlugin {
  name = 'transform';
  version = '1.0.0';
  
  private transformers = new Map<string, (data: unknown) => unknown>();
  
  registerTransformer(collection: string, transformer: (data: unknown) => unknown) {
    this.transformers.set(collection, transformer);
  }
  
  onUpdate(document: SyncDocument) {
    const transformer = this.transformers.get(document.collection);
    if (transformer) {
      document.data = transformer(document.data) as typeof document.data;
    }
  }
}
```

## Server-Side Plugins

### Server Plugin Interface

```typescript
interface ServerPlugin {
  name: string;
  version: string;
  
  onSyncRequest?(userId: string, request: SyncRequest): void | Promise<void>;
  onDocumentCreated?(document: SyncDocument): void | Promise<void>;
  onDocumentUpdated?(document: SyncDocument): void | Promise<void>;
  onDocumentDeleted?(collection: string, id: string): void | Promise<void>;
}
```

### Example: Audit Plugin

```typescript
export class AuditPlugin implements ServerPlugin {
  name = 'audit';
  version = '1.0.0';
  
  async onDocumentCreated(document: SyncDocument) {
    await this.logAudit('create', document);
  }
  
  async onDocumentUpdated(document: SyncDocument) {
    await this.logAudit('update', document);
  }
  
  async onDocumentDeleted(collection: string, id: string) {
    await this.logAudit('delete', { collection, id });
  }
  
  private async logAudit(action: string, data: unknown) {
    await db.insert(auditLogs).values({
      action,
      data: JSON.stringify(data),
      timestamp: new Date(),
    });
  }
}
```

## Plugin Registration

### Client-Side

```typescript
// Extend SyncClient to support plugins
class ExtendedSyncClient extends SyncClient {
  private plugins: SyncPlugin[] = [];
  
  registerPlugin(plugin: SyncPlugin) {
    this.plugins.push(plugin);
    
    if (this.initialized) {
      plugin.onInit?.(this);
    }
  }
  
  async init() {
    await super.init();
    
    for (const plugin of this.plugins) {
      await plugin.onInit?.(this);
    }
  }
}
```

### Server-Side

```typescript
class ExtendedSyncService extends SyncService {
  private plugins: ServerPlugin[] = [];
  
  registerPlugin(plugin: ServerPlugin) {
    this.plugins.push(plugin);
  }
  
  async getSyncResponse(userId: string, request: SyncRequest) {
    for (const plugin of this.plugins) {
      await plugin.onSyncRequest?.(userId, request);
    }
    
    return await super.getSyncResponse(userId, request);
  }
}
```

## Best Practices

1. **Idempotent Operations**: Make plugin operations idempotent
2. **Error Handling**: Handle errors gracefully, don't break sync
3. **Performance**: Keep plugin operations fast
4. **Documentation**: Document plugin behavior
5. **Testing**: Write tests for plugins
6. **Versioning**: Version plugins properly

## Publishing Plugins

### Package Structure

```
my-sync-plugin/
├── src/
│   └── index.ts
├── package.json
├── README.md
└── tsconfig.json
```

### Package.json

```json
{
  "name": "@my-org/sync-plugin-analytics",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "peerDependencies": {
    "@bcc-events/data-sync": "^0.1.0"
  }
}
```

## Next Steps

- [Extending the System](./17-extending.md)
- [Contributing Guide](./19-contributing.md)
- [Examples](./examples/)
