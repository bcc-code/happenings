/**
 * Elysia routes for sync API
 */

import { Elysia } from 'elysia';
import type { SyncRequest, SyncResponse } from '../types';
import type { SyncService } from './sync-service';

export interface SyncRoutesConfig {
  syncService: SyncService;
  requireAuth: (app: Elysia) => Elysia;
}

/**
 * Create Elysia routes for sync API
 */
export function createSyncRoutes(config: SyncRoutesConfig): Elysia {
  const { syncService, requireAuth } = config;

  const app = new Elysia();

  // Apply auth middleware
  app.use(requireAuth);

  // Sync endpoint
  app.get('/api/sync', async ({ query, store }: any) => {
    const userId = (store as any).userId || (store as any).user?.id;

    if (!userId) {
      return {
        error: 'Unauthorized',
      };
    }

    const request: SyncRequest = {
      collection: query.collection as string,
      since: query.since ? new Date(query.since as string) : undefined,
      limit: query.limit ? parseInt(query.limit as string, 10) : undefined,
      offset: query.offset ? parseInt(query.offset as string, 10) : undefined,
    };

    if (!request.collection) {
      return {
        error: 'Collection is required',
      };
    }

    try {
      const response = await syncService.getSyncResponse(userId, request);
      return response;
    } catch (error) {
      return {
        error: (error as Error).message,
      };
    }
  });

  return app;
}
