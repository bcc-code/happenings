/**
 * @swagger
 * /admin/events:
 *   get:
 *     summary: List all events (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-ID
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
import type { Context } from 'elysia';
import { getEventsForTenant } from '../../db/query-helpers';
import { error } from '../../utils/response';

export async function listEvents({ store }: Context) {
  try {
    const tenantId = store.user?.tenantId;
    
    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }

    const events = await getEventsForTenant(tenantId);

    return { data: events };
  } catch (err) {
    console.error('Error fetching events:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
