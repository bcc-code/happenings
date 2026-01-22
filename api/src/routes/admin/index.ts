/**
 * Admin routes - requires admin role
 */

import { Elysia } from 'elysia';
import { requireAdmin, requireAuth, verifyToken } from '../../middleware/auth';
import { tenantContext } from '../../middleware/tenant';
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEventRegistrations,
  listEvents,
  updateEvent,
} from './events';

const router = new Elysia();

// All admin routes require authentication and admin role
router.onBeforeHandle(verifyToken);
router.onBeforeHandle(requireAuth);
router.onBeforeHandle(tenantContext);
router.onBeforeHandle(requireAdmin);

// Admin routes
router.get('/events', listEvents);
router.post('/events', createEvent);
router.get('/events/:id', getEvent);
router.put('/events/:id', updateEvent);
router.patch('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);
router.get('/events/:id/registrations', listEventRegistrations);

// Add more admin routes here
// router.get('/users', listUsers);
// router.get('/settings', getSettings);

export default router;
