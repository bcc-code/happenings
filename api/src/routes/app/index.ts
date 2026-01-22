/**
 * App routes - for end users (limited to themselves and relatives)
 */

import { Elysia } from 'elysia';
import { verifyToken, requireAuth, requireUserAccess } from '../../middleware/auth';
import { tenantContext } from '../../middleware/tenant';
import { getProfile } from './profile';
import { getAppEvent, listAppEvents } from './events';
import { cancelRegistration, createRegistration, listMyRegistrations } from './registrations';

const router = new Elysia();

// All app routes require authentication
router.onBeforeHandle(verifyToken);
router.onBeforeHandle(requireAuth);

// App routes
router.get('/profile', getProfile);

// Routes that require tenant context
router.group('', (app) => {
  app.onBeforeHandle(tenantContext);

  // Events
  app.get('/events', listAppEvents);
  app.get('/events/:id', getAppEvent);

  // Registrations (self for now)
  app.get('/registrations', listMyRegistrations);
  app.post('/registrations', createRegistration);
  app.post('/registrations/:id/cancel', cancelRegistration);

  return app;
});

export default router;
