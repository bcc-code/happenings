/**
 * Permission API Routes
 * 
 * Provides endpoints for fetching permission-related data.
 * These endpoints are used by the frontend to check permissions.
 */

import { Elysia } from 'elysia';
import { requireAuth } from '../../middleware/auth';
import {
  getUserGroupIds,
  getDocumentGroupIds,
  getGroupPermissions,
} from '../../utils/permissions';
import { success } from '../../utils/response';

export const permissionsRoutes = new Elysia({ prefix: '/permissions' })
  .use(requireAuth)
  .get('/user-groups', async ({ store, query }) => {
    const userId = store.user?.id;
    const tenantId = query.tenantId || store.user?.tenantId;

    if (!userId || !tenantId) {
      return { error: 'User ID and Tenant ID required' };
    }

    // Get user's groups
    const userGroupIds = await getUserGroupIds(userId, tenantId);

    // Get all permissions for this tenant (filtered by user groups)
    const groupPermissions = await getGroupPermissions(tenantId, {
      userGroupIds,
    });

    return success({
      userGroupIds,
      groupPermissions,
    });
  })
  .get('/document-groups', async ({ store, query }) => {
    const entityType = query.entityType as string;
    const entityId = query.entityId as string;
    const tenantId = query.tenantId || store.user?.tenantId;

    if (!entityType || !entityId || !tenantId) {
      return { error: 'Entity type, entity ID, and tenant ID required' };
    }

    // Get document groups for the entity
    const groupIds = await getDocumentGroupIds(entityType, entityId, tenantId);

    return success({
      groupIds,
    });
  })
  .get('/check', async ({ store, query }) => {
    const userId = store.user?.id;
    const tenantId = query.tenantId || store.user?.tenantId;
    const entityType = query.entityType as string;
    const entityId = query.entityId as string;
    const action = query.action as string;

    if (!userId || !tenantId || !entityType || !entityId || !action) {
      return { error: 'All parameters required' };
    }

    const { checkUserPermission } = await import('../../utils/permissions');
    const result = await checkUserPermission(
      userId,
      tenantId,
      entityType,
      entityId,
      action as any
    );

    return success(result);
  });
