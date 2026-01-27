/**
 * Shared Vue composables
 * 
 * Note: These are Vue 3 Composition API composables
 * Only import in frontend applications (admin-dashboard, end-user-app)
 * Do not import in API
 */

// Re-export composables here
// Example structure for when composables are added:

// export { useApi } from './useApi';
// export { useAuth } from './useAuth';
// export { useTenant } from './useTenant';
// export { useEvent } from './useEvent';
// export { useRegistration } from './useRegistration';

// Permission composables
export { usePermissions, useDocumentGroups } from './usePermissions';
