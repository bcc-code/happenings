/**
 * App routes - for end users (limited to themselves and relatives)
 */

import { Elysia } from 'elysia';
import { verifyToken, requireAuth, requireUserAccess } from '../../middleware/auth';
import { getProfile } from './profile';

const router = new Elysia();

// All app routes require authentication
router.onBeforeHandle(verifyToken);
router.onBeforeHandle(requireAuth);

// App routes
router.get('/profile', getProfile);

// Routes that need user access control
// router.get('/users/:userId', requireUserAccess, getUser);

// Add more app routes here
// router.get('/events', listEvents);
// router.post('/registrations', createRegistration);

export default router;
