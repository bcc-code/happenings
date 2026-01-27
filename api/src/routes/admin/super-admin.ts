/**
 * Super Admin routes - requires super_admin role
 * These routes don't require tenant context
 */

import { Elysia } from 'elysia';
import { requireAuth, requireSuperAdmin, verifyToken } from '../../middleware/auth';
import {
  listCollections,
  getCollection,
  createCollectionHandler,
} from './collections';
import { createTenant, deleteTenant, getTenant, listTenants, updateTenant } from './tenants';
import {
  listCollectionItems,
  getCollectionItemHandler,
  createCollectionItemHandler,
  updateCollectionItemHandler,
  deleteCollectionItemHandler,
} from './collection-items';
import {
  createTenantEvent,
  deleteTenantEvent,
  getTenantEvent,
  getTenantEventAuditLogs,
  listTenantEventRegistrations,
  listTenantEvents,
  updateTenantEvent,
} from './super-admin-events';

const router = new Elysia();

// All super admin routes require authentication and super_admin role
// Note: verifySuperAdminToken will be checked in requireSuperAdmin
// We skip verifyToken/requireAuth for simple JWT tokens
router.onBeforeHandle(async (context) => {
  // Try simple JWT token first
  const { verifySuperAdminToken } = await import('../../middleware/auth');
  const superAdminToken = await verifySuperAdminToken(context);
  
  if (!superAdminToken) {
    // Fall back to Auth0 authentication
    await verifyToken(context);
    await requireAuth(context);
  }
});
router.onBeforeHandle(requireSuperAdmin);

// Collections management
router.get('/collections', listCollections);
router.get('/collections/:id', getCollection);
router.post('/collections', createCollectionHandler);

// Tenants
router.get('/tenants', listTenants);
router.get('/tenants/:tenantId', getTenant);
router.post('/tenants', createTenant);
router.put('/tenants/:tenantId', updateTenant);
router.patch('/tenants/:tenantId', updateTenant);
router.delete('/tenants/:tenantId', deleteTenant);

// Events per tenant
router.get('/tenants/:tenantId/events', listTenantEvents);
router.post('/tenants/:tenantId/events', createTenantEvent);
router.get('/tenants/:tenantId/events/:id', getTenantEvent);
router.put('/tenants/:tenantId/events/:id', updateTenantEvent);
router.patch('/tenants/:tenantId/events/:id', updateTenantEvent);
router.delete('/tenants/:tenantId/events/:id', deleteTenantEvent);
router.get('/tenants/:tenantId/events/:id/registrations', listTenantEventRegistrations);
router.get('/tenants/:tenantId/events/:id/audit-logs', getTenantEventAuditLogs);

// Collection items
router.get('/collections/:id/items', listCollectionItems);
router.get('/collections/:id/items/:itemId', getCollectionItemHandler);
router.post('/collections/:id/items', createCollectionItemHandler);
router.put('/collections/:id/items/:itemId', updateCollectionItemHandler);
router.patch('/collections/:id/items/:itemId', updateCollectionItemHandler);
router.delete('/collections/:id/items/:itemId', deleteCollectionItemHandler);

export default router;
