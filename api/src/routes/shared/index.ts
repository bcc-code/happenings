/**
 * Shared routes - available to both admin and app
 */

import { Elysia } from 'elysia';
import { verifyToken, requireAuth } from '../../middleware/auth';
import { healthHandler } from './health';
import authRouter from './auth';
import { permissionsRoutes } from './permissions';

const router = new Elysia();

// Health check (no auth required)
router.get('/health', healthHandler);

// Auth routes (no auth required)
router.use(authRouter);

// All other shared routes require authentication
router.onBeforeHandle(verifyToken);
router.onBeforeHandle(requireAuth);

// Permission routes (auth required)
router.use(permissionsRoutes);

// Add more shared routes here
// router.get('/events/public', publicEventsHandler);

export default router;
