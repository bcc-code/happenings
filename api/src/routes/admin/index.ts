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
  getEventAuditLogs,
  listEventRegistrations,
  listEvents,
  updateEvent,
} from './events';
import {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} from './users';
import {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
} from './groups';

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
router.get('/events/:id/audit-logs', getEventAuditLogs);

// User management routes
router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Group management routes
router.get('/groups', listGroups);
router.post('/groups', createGroup);
router.get('/groups/:id', getGroup);
router.put('/groups/:id', updateGroup);
router.patch('/groups/:id', updateGroup);
router.delete('/groups/:id', deleteGroup);
router.post('/groups/:id/members', addGroupMember);
router.delete('/groups/:id/members/:memberId', removeGroupMember);

export default router;
