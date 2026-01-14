/**
 * Admin routes - requires admin role
 */

import { Elysia } from 'elysia';
import { requireAdmin, requireAuth, verifyToken } from '../../middleware/auth';
import { tenantContext } from '../../middleware/tenant';
import { listEvents } from './events';

const router = new Elysia();

// All admin routes require authentication and admin role
router.onBeforeHandle(verifyToken);
router.onBeforeHandle(requireAuth);
router.onBeforeHandle(tenantContext);
router.onBeforeHandle(requireAdmin);

// Admin routes
router.get('/events', listEvents);

// Add more admin routes here
// router.get('/users', listUsers);
// router.get('/settings', getSettings);

export default router;
