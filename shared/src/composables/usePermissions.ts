/**
 * Vue Composable for Permission Checking
 * 
 * Provides reactive permission checking utilities for Vue components.
 * Can be used in both admin-dashboard and end-user-app.
 */

import { ref, computed, watch, type Ref } from 'vue';
import type {
  PermissionLevel,
  PermissionResult,
  GroupPermission,
} from '../types';
import {
  checkPermission,
  hasPermissionLevel,
  getHighestPermissionLevel,
} from '../utils/permissions';

/**
 * Permission state interface
 */
export interface PermissionState {
  userGroupIds: string[];
  groupPermissions: GroupPermission[];
  loading: boolean;
  error: string | null;
}

/**
 * Composable for checking permissions in Vue components
 * 
 * @example
 * ```vue
 * <script setup>
 * const { hasPermission, checkItemPermission } = usePermissions();
 * 
 * // Check if user can edit an event
 * const canEdit = computed(() => 
 *   checkItemPermission('Event', eventId.value, 'edit')
 * );
 * </script>
 * ```
 */
export function usePermissions() {
  const state: Ref<PermissionState> = ref({
    userGroupIds: [],
    groupPermissions: [],
    loading: false,
    error: null,
  });

  /**
   * Initialize permission state with user's groups and permissions
   * This should be called after user authentication
   */
  async function initializePermissions(
    userId: string,
    tenantId: string
  ): Promise<void> {
    state.value.loading = true;
    state.value.error = null;

    try {
      // Fetch user groups and permissions from API
      // This would typically call an API endpoint like:
      // GET /api/app/permissions/user-groups?userId=...&tenantId=...
      const response = await fetch(
        `/api/app/permissions/user-groups?userId=${userId}&tenantId=${tenantId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      state.value.userGroupIds = data.userGroupIds || [];
      state.value.groupPermissions = data.groupPermissions || [];
    } catch (error) {
      state.value.error =
        error instanceof Error ? error.message : 'Failed to load permissions';
      console.error('Permission initialization error:', error);
    } finally {
      state.value.loading = false;
    }
  }

  /**
   * Check if user has permission for an item
   * 
   * @param entityType - Type of entity (e.g., 'Event', 'Post')
   * @param entityId - ID of the entity
   * @param requiredAction - Required permission level
   * @param documentGroupIds - Optional: pre-fetched document group IDs
   * @returns PermissionResult
   */
  function checkItemPermission(
    entityType: string,
    entityId: string,
    requiredAction: PermissionLevel,
    documentGroupIds?: string[]
  ): PermissionResult {
    if (state.value.userGroupIds.length === 0) {
      return {
        allowed: false,
        reason: 'User groups not loaded',
      };
    }

    // If document group IDs not provided, we'd need to fetch them
    // For now, return a result indicating we need to fetch them
    if (!documentGroupIds || documentGroupIds.length === 0) {
      return {
        allowed: false,
        reason: 'Document groups not provided',
      };
    }

    return checkPermission(
      state.value.userGroupIds,
      documentGroupIds,
      state.value.groupPermissions,
      requiredAction
    );
  }

  /**
   * Check if user has a specific permission level
   */
  function hasLevel(
    userLevel: PermissionLevel,
    requiredLevel: PermissionLevel
  ): boolean {
    return hasPermissionLevel(userLevel, requiredLevel);
  }

  /**
   * Get the highest permission level for a set of groups
   */
  function getHighestLevel(levels: PermissionLevel[]): PermissionLevel | null {
    return getHighestPermissionLevel(levels);
  }

  /**
   * Reactive computed: Check if user can view an item
   */
  function canView(entityType: string, entityId: string, documentGroupIds?: string[]) {
    return computed(() =>
      checkItemPermission(entityType, entityId, 'view', documentGroupIds).allowed
    );
  }

  /**
   * Reactive computed: Check if user can edit an item
   */
  function canEdit(entityType: string, entityId: string, documentGroupIds?: string[]) {
    return computed(() =>
      checkItemPermission(entityType, entityId, 'edit', documentGroupIds).allowed
    );
  }

  /**
   * Reactive computed: Check if user can manage an item
   */
  function canManage(entityType: string, entityId: string, documentGroupIds?: string[]) {
    return computed(() =>
      checkItemPermission(entityType, entityId, 'manage', documentGroupIds).allowed
    );
  }

  /**
   * Reactive computed: Check if user owns an item
   */
  function isOwner(entityType: string, entityId: string, documentGroupIds?: string[]) {
    return computed(() =>
      checkItemPermission(entityType, entityId, 'owner', documentGroupIds).allowed
    );
  }

  return {
    // State
    state: computed(() => state.value),
    loading: computed(() => state.value.loading),
    error: computed(() => state.value.error),

    // Methods
    initializePermissions,
    checkItemPermission,
    hasLevel,
    getHighestLevel,

    // Convenience computed functions
    canView,
    canEdit,
    canManage,
    isOwner,
  };
}

/**
 * Composable for fetching document group IDs for an item
 * 
 * @example
 * ```vue
 * <script setup>
 * const { documentGroupIds, loading } = useDocumentGroups('Event', eventId);
 * const { canEdit } = usePermissions();
 * 
 * const canEditEvent = canEdit('Event', eventId, documentGroupIds.value);
 * </script>
 * ```
 */
export function useDocumentGroups(
  entityType: string,
  entityId: string | Ref<string>
) {
  const documentGroupIds = ref<string[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchDocumentGroups() {
    const id = typeof entityId === 'string' ? entityId : entityId.value;
    if (!id) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `/api/app/permissions/document-groups?entityType=${entityType}&entityId=${id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch document groups');
      }

      const data = await response.json();
      documentGroupIds.value = data.groupIds || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load document groups';
      console.error('Document groups fetch error:', err);
    } finally {
      loading.value = false;
    }
  }

  // Auto-fetch when entityId changes
  if (typeof entityId !== 'string') {
    watch(entityId, fetchDocumentGroups, { immediate: true });
  } else {
    fetchDocumentGroups();
  }

  return {
    documentGroupIds,
    loading,
    error,
    refetch: fetchDocumentGroups,
  };
}
