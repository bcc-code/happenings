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
import {
  listCollectionItems,
  getCollectionItemHandler,
  createCollectionItemHandler,
  updateCollectionItemHandler,
  deleteCollectionItemHandler,
} from './collection-items';

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

// Collection items
router.get('/collections/:id/items', listCollectionItems);
router.get('/collections/:id/items/:itemId', getCollectionItemHandler);
router.post('/collections/:id/items', createCollectionItemHandler);
router.put('/collections/:id/items/:itemId', updateCollectionItemHandler);
router.patch('/collections/:id/items/:itemId', updateCollectionItemHandler);
router.delete('/collections/:id/items/:itemId', deleteCollectionItemHandler);

export default router;
