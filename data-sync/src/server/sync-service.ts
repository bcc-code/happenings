/**
 * Server-side sync service for handling data synchronization
 */

import type {
  SyncDocument,
  DeletionRecord,
  SyncRequest,
  SyncResponse,
  Permission,
  PermissionAction,
} from '../types';
import { hasPermission } from '../types/permissions';

export interface SyncServiceConfig {
  getDocuments: (
    collection: string,
    since?: Date,
    limit?: number,
    offset?: number
  ) => Promise<SyncDocument[]>;
  getDeletions: (collection: string, since?: Date) => Promise<DeletionRecord[]>;
  getUserPermissions: (userId: string) => Promise<Permission[]>;
  getUserGroups: (userId: string) => Promise<string[]>;
}

export class SyncService {
  private config: SyncServiceConfig;

  constructor(config: SyncServiceConfig) {
    this.config = config;
  }

  /**
   * Get sync response for a collection
   */
  async getSyncResponse(
    userId: string,
    request: SyncRequest
  ): Promise<SyncResponse> {
    // Get user permissions and groups
    const [permissions, userGroups] = await Promise.all([
      this.config.getUserPermissions(userId),
      this.config.getUserGroups(userId),
    ]);

    // Check if user has read permission for this collection
    if (
      !hasPermission(
        permissions,
        userId,
        userGroups,
        request.collection,
        undefined,
        PermissionAction.READ
      )
    ) {
      throw new Error('Permission denied');
    }

    // Fetch documents and deletions
    const [allDocuments, deletions] = await Promise.all([
      this.config.getDocuments(
        request.collection,
        request.since,
        request.limit,
        request.offset
      ),
      this.config.getDeletions(request.collection, request.since),
    ]);

    // Filter documents by permissions
    const documents = allDocuments.filter((doc) =>
      hasPermission(
        permissions,
        userId,
        userGroups,
        doc.collection,
        doc.id,
        PermissionAction.READ
      )
    );

    // Filter deletions by permissions
    const filteredDeletions = deletions.filter((del) =>
      hasPermission(
        permissions,
        userId,
        userGroups,
        del.collection,
        del.id,
        PermissionAction.READ
      )
    );

    return {
      collection: request.collection,
      documents,
      deletions: filteredDeletions,
      hasMore: request.limit ? documents.length >= request.limit : false,
    };
  }

  /**
   * Check if user can perform action on document
   */
  async checkPermission(
    userId: string,
    collection: string,
    itemId: string | undefined,
    action: PermissionAction
  ): Promise<boolean> {
    const [permissions, userGroups] = await Promise.all([
      this.config.getUserPermissions(userId),
      this.config.getUserGroups(userId),
    ]);

    return hasPermission(permissions, userId, userGroups, collection, itemId, action);
  }
}
