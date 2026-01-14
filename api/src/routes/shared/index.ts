/**
 * Shared routes - available to both admin and app
 */

import { Elysia } from 'elysia';
import { verifyToken, requireAuth } from '../../middleware/auth';
import { healthHandler } from './health';

const router = new Elysia();

// Health check (no auth required)
router.get('/health', healthHandler);

// All other shared routes require authentication
router.onBeforeHandle(verifyToken);
router.onBeforeHandle(requireAuth);

// Add more shared routes here
// router.get('/events/public', publicEventsHandler);

export default router;
