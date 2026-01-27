/**
 * Permission System Utilities
 * 
 * Shared permission parser and validator that can be used in both API and frontend.
 * 
 * The permission system works as follows:
 * 1. Users belong to user groups (via GroupMember)
 * 2. Items/documents belong to document groups (via GroupAssignment)
 * 3. User groups are linked to document groups with permission levels (via GroupPermission)
 * 4. To check permissions: get user's groups → get item's groups → check if any user group
 *    has the required permission level on any of the item's document groups
 */

import type {
  GroupPermission,
  PermissionLevel,
  PermissionResult,
  PermissionContext,
} from '../types';

/**
 * Permission level hierarchy
 * Higher levels include all lower levels
 */
const PERMISSION_HIERARCHY: Record<PermissionLevel, number> = {
  view: 1,
  edit: 2,
  manage: 3,
  owner: 4,
};

/**
 * Check if a permission level satisfies a required action
 * Higher permission levels include all lower levels
 * 
 * @example
 * hasPermissionLevel('manage', 'edit') // true - manage includes edit
 * hasPermissionLevel('view', 'edit') // false - view doesn't include edit
 */
export function hasPermissionLevel(
  userLevel: PermissionLevel,
  requiredLevel: PermissionLevel
): boolean {
  return PERMISSION_HIERARCHY[userLevel] >= PERMISSION_HIERARCHY[requiredLevel];
}

/**
 * Get the highest permission level from an array of permission levels
 */
export function getHighestPermissionLevel(
  levels: PermissionLevel[]
): PermissionLevel | null {
  if (levels.length === 0) return null;

  return levels.reduce((highest, current) => {
    return PERMISSION_HIERARCHY[current] > PERMISSION_HIERARCHY[highest]
      ? current
      : highest;
  });
}

/**
 * Check if user has permission based on group permissions
 * 
 * This is the core permission checking function. It takes:
 * - User's group IDs (from GroupMember)
 * - Item's document group IDs (from GroupAssignment)
 * - Group permissions (from GroupPermission)
 * - Required action level
 * 
 * @param userGroupIds - Array of group IDs the user belongs to
 * @param documentGroupIds - Array of group IDs the item/document belongs to
 * @param groupPermissions - Array of all group permissions to check against
 * @param requiredAction - The minimum permission level required (view, edit, manage, owner)
 * @returns PermissionResult indicating if access is allowed and at what level
 */
export function checkPermission(
  userGroupIds: string[],
  documentGroupIds: string[],
  groupPermissions: GroupPermission[],
  requiredAction: PermissionLevel
): PermissionResult {
  // If user has no groups, deny access
  if (userGroupIds.length === 0) {
    return {
      allowed: false,
      reason: 'User does not belong to any groups',
    };
  }

  // If item has no groups, deny access (unless there's a default group)
  if (documentGroupIds.length === 0) {
    return {
      allowed: false,
      reason: 'Item does not belong to any groups',
    };
  }

  // Find all permissions where:
  // - The user group is in userGroupIds
  // - The document group is in documentGroupIds
  const relevantPermissions = groupPermissions.filter(
    (perm) =>
      userGroupIds.includes(perm.userGroupId) &&
      documentGroupIds.includes(perm.documentGroupId)
  );

  if (relevantPermissions.length === 0) {
    return {
      allowed: false,
      reason: 'No permission link found between user groups and document groups',
    };
  }

  // Get the highest permission level the user has
  const userLevels = relevantPermissions.map((p) => p.permissionLevel);
  const highestLevel = getHighestPermissionLevel(userLevels);

  if (!highestLevel) {
    return {
      allowed: false,
      reason: 'No valid permission level found',
    };
  }

  // Check if the highest level satisfies the required action
  const allowed = hasPermissionLevel(highestLevel, requiredAction);

  return {
    allowed,
    level: highestLevel,
    reason: allowed
      ? undefined
      : `User has ${highestLevel} permission but ${requiredAction} is required`,
  };
}

/**
 * Parse permission context and check permissions
 * 
 * This is a convenience function that takes a PermissionContext and
 * performs the permission check. It's designed to be used with data
 * fetched from the database.
 * 
 * @param context - Permission check context
 * @param groupPermissions - Array of all group permissions to check against
 * @returns PermissionResult
 */
export function checkPermissionWithContext(
  context: PermissionContext,
  groupPermissions: GroupPermission[]
): PermissionResult {
  return checkPermission(
    context.userGroupIds,
    [], // documentGroupIds should be fetched separately based on entityType/entityId
    groupPermissions,
    context.action
  );
}

/**
 * Validate that a permission level string is valid
 */
export function isValidPermissionLevel(
  level: string
): level is PermissionLevel {
  return ['view', 'edit', 'manage', 'owner'].includes(level);
}

/**
 * Compare two permission levels
 * Returns:
 * - -1 if level1 < level2
 * - 0 if level1 === level2
 * - 1 if level1 > level2
 */
export function comparePermissionLevels(
  level1: PermissionLevel,
  level2: PermissionLevel
): number {
  const diff = PERMISSION_HIERARCHY[level1] - PERMISSION_HIERARCHY[level2];
  return diff < 0 ? -1 : diff > 0 ? 1 : 0;
}

/**
 * Get all permission levels that are included in a given level
 * 
 * @example
 * getIncludedLevels('manage') // ['view', 'edit', 'manage']
 */
export function getIncludedLevels(
  level: PermissionLevel
): PermissionLevel[] {
  const levels: PermissionLevel[] = ['view', 'edit', 'manage', 'owner'];
  const levelIndex = PERMISSION_HIERARCHY[level] - 1;
  return levels.slice(0, levelIndex + 1);
}
