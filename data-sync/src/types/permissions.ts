/**
 * Permission management utilities
 */

import type { Permission, PermissionAction, PermissionScope } from './index';

/**
 * Check if a user has permission for an action
 */
export function hasPermission(
  permissions: Permission[],
  userId: string,
  userGroups: string[],
  collection: string,
  itemId: string | undefined,
  action: PermissionAction
): boolean {
  return permissions.some((perm) => {
    // Check if permission applies to this collection
    if (perm.collection !== collection) {
      return false;
    }

    // Check if permission applies to this item (or collection level)
    if (perm.itemId && perm.itemId !== itemId) {
      return false;
    }

    // Check if user or group matches
    const userMatch = perm.userId === userId;
    const groupMatch = perm.groupId && userGroups.includes(perm.groupId);

    if (!userMatch && !groupMatch) {
      return false;
    }

    // Check if action is allowed
    return perm.actions.includes(action) || perm.actions.includes(PermissionAction.ADMIN);
  });
}

/**
 * Filter documents based on permissions
 */
export function filterByPermissions<T>(
  documents: Array<{ id: string; collection: string }>,
  permissions: Permission[],
  userId: string,
  userGroups: string[],
  action: PermissionAction = PermissionAction.READ
): Array<{ id: string; collection: string }> {
  return documents.filter((doc) =>
    hasPermission(permissions, userId, userGroups, doc.collection, doc.id, action)
  );
}

/**
 * Get all collections a user has access to
 */
export function getAccessibleCollections(
  permissions: Permission[],
  userId: string,
  userGroups: string[]
): string[] {
  const collections = new Set<string>();

  permissions.forEach((perm) => {
    const userMatch = perm.userId === userId;
    const groupMatch = perm.groupId && userGroups.includes(perm.groupId);

    if (userMatch || groupMatch) {
      collections.add(perm.collection);
    }
  });

  return Array.from(collections);
}
