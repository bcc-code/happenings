/**
 * API Permission Helpers
 * 
 * Provides database queries and middleware for permission checking in the API.
 * Uses the shared permission utilities from @bcc-events/shared.
 */

import {
  checkPermission,
  type PermissionLevel,
  type PermissionResult,
} from '@bcc-events/shared';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../db/client';
import {
  groupAssignments,
  groupMembers,
  groupPermissions,
  groups,
} from '../db/schema';
import type { AuthenticatedContext } from '../middleware/auth';

/**
 * Get all group IDs that a user belongs to (user groups)
 */
export async function getUserGroupIds(
  userId: string,
  tenantId: string
): Promise<string[]> {
  const userGroups = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(
      and(
        eq(groupMembers.userId, userId),
        eq(groups.tenantId, tenantId)
      )
    );

  return userGroups.map((g) => g.groupId);
}

/**
 * Get all document group IDs that an item belongs to
 */
export async function getDocumentGroupIds(
  entityType: string,
  entityId: string,
  tenantId: string
): Promise<string[]> {
  const assignments = await db
    .select({ groupId: groupAssignments.groupId })
    .from(groupAssignments)
    .innerJoin(groups, eq(groupAssignments.groupId, groups.id))
    .where(
      and(
        eq(groupAssignments.entityType, entityType),
        eq(groupAssignments.entityId, entityId),
        eq(groups.tenantId, tenantId)
      )
    );

  return assignments.map((a) => a.groupId);
}

/**
 * Get all group permissions for a tenant
 * Optionally filtered by user groups and/or document groups
 */
export async function getGroupPermissions(
  tenantId: string,
  options?: {
    userGroupIds?: string[];
    documentGroupIds?: string[];
  }
): Promise<typeof groupPermissions.$inferSelect[]> {
  // Build conditions
  const conditions = [
    eq(groups.tenantId, tenantId),
  ];

  // Filter by user groups if provided
  if (options?.userGroupIds && options.userGroupIds.length > 0) {
    conditions.push(inArray(groupPermissions.userGroupId, options.userGroupIds));
  }

  // Filter by document groups if provided
  if (options?.documentGroupIds && options.documentGroupIds.length > 0) {
    conditions.push(inArray(groupPermissions.documentGroupId, options.documentGroupIds));
  }

  const results = await db
    .select({
      id: groupPermissions.id,
      userGroupId: groupPermissions.userGroupId,
      documentGroupId: groupPermissions.documentGroupId,
      permissionLevel: groupPermissions.permissionLevel,
      grantedAt: groupPermissions.grantedAt,
      grantedBy: groupPermissions.grantedBy,
      metadata: groupPermissions.metadata,
    })
    .from(groupPermissions)
    .innerJoin(
      groups,
      eq(groupPermissions.userGroupId, groups.id)
    )
    .where(and(...conditions));

  return results;
}

/**
 * Check if user has permission to perform an action on an item
 * 
 * This is the main function to use in API routes for permission checking.
 * 
 * @param userId - User ID
 * @param tenantId - Tenant ID
 * @param entityType - Type of entity (e.g., 'Event', 'Post')
 * @param entityId - ID of the entity
 * @param requiredAction - Required permission level (view, edit, manage, owner)
 * @returns PermissionResult
 */
export async function checkUserPermission(
  userId: string,
  tenantId: string,
  entityType: string,
  entityId: string,
  requiredAction: PermissionLevel
): Promise<PermissionResult> {
  // Get user's groups
  const userGroupIds = await getUserGroupIds(userId, tenantId);

  // Get item's document groups
  const documentGroupIds = await getDocumentGroupIds(
    entityType,
    entityId,
    tenantId
  );

  // Get relevant group permissions
  const permissions = await getGroupPermissions(tenantId, {
    userGroupIds,
    documentGroupIds,
  });

  // Check permission using shared utility
  return checkPermission(
    userGroupIds,
    documentGroupIds,
    permissions,
    requiredAction
  );
}

/**
 * Middleware to require permission for an action
 * 
 * Usage in Elysia routes:
 * ```typescript
 * app.get('/events/:id', async ({ params, store }) => {
 *   await requirePermission(
 *     { store },
 *     'Event',
 *     params.id,
 *     'view'
 *   );
 *   // ... rest of handler
 * });
 * ```
 */
export async function requirePermission(
  context: AuthenticatedContext,
  entityType: string,
  entityId: string,
  requiredAction: PermissionLevel
): Promise<PermissionResult | void> {
  const { store } = context;

  if (!store.user) {
    throw new Error('User not authenticated');
  }

  const tenantId = store.user.tenantId;
  if (!tenantId) {
    throw new Error('Tenant context required');
  }

  const result = await checkUserPermission(
    store.user.id,
    tenantId,
    entityType,
    entityId,
    requiredAction
  );

  if (!result.allowed) {
    const { forbidden } = await import('./response');
    return forbidden(
      result.reason || `Permission denied: ${requiredAction} required`
    );
  }

  return result;
}

/**
 * Assign an item to a document group
 * 
 * This is typically called when an item's state changes (e.g., post becomes published)
 * or when business rules determine group membership.
 */
export async function assignToGroup(
  groupId: string,
  entityType: string,
  entityId: string,
  assignedBy?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await db.insert(groupAssignments).values({
    groupId,
    entityType,
    entityId,
    assignedBy: assignedBy || null,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

/**
 * Remove an item from a document group
 */
export async function removeFromGroup(
  groupId: string,
  entityType: string,
  entityId: string
): Promise<void> {
  await db
    .delete(groupAssignments)
    .where(
      and(
        eq(groupAssignments.groupId, groupId),
        eq(groupAssignments.entityType, entityType),
        eq(groupAssignments.entityId, entityId)
      )
    );
}

/**
 * Get or create a system group by slug
 * System groups are automatically created based on business rules
 * (e.g., "Published", "Draft", "Public", "Private")
 */
export async function getOrCreateSystemGroup(
  tenantId: string,
  slug: string,
  name: string,
  description?: string,
  metadata?: Record<string, any>
): Promise<string> {
  // Try to find existing group
  const existing = await db.query.groups.findFirst({
    where: and(
      eq(groups.tenantId, tenantId),
      eq(groups.slug, slug)
    ),
  });

  if (existing) {
    return existing.id;
  }

  // Create new system group
  const [newGroup] = await db
    .insert(groups)
    .values({
      tenantId,
      slug,
      name,
      description: description || null,
      type: 'document_group',
      isSystem: true,
      metadata: metadata ? JSON.stringify(metadata) : null,
    })
    .returning();

  return newGroup.id;
}

/**
 * Grant permission from a user group to a document group
 */
export async function grantPermission(
  userGroupId: string,
  documentGroupId: string,
  permissionLevel: PermissionLevel,
  grantedBy?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await db
    .insert(groupPermissions)
    .values({
      userGroupId,
      documentGroupId,
      permissionLevel,
      grantedBy: grantedBy || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    })
    .onConflictDoUpdate({
      target: [
        groupPermissions.userGroupId,
        groupPermissions.documentGroupId,
      ],
      set: {
        permissionLevel,
        grantedBy: grantedBy || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
}

/**
 * Revoke permission from a user group to a document group
 */
export async function revokePermission(
  userGroupId: string,
  documentGroupId: string
): Promise<void> {
  await db
    .delete(groupPermissions)
    .where(
      and(
        eq(groupPermissions.userGroupId, userGroupId),
        eq(groupPermissions.documentGroupId, documentGroupId)
      )
    );
}
