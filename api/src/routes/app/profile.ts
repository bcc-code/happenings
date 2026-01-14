/**
 * @swagger
 * /app/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [App]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
import type { Context } from 'elysia';
import { getUserById } from '../../db/query-helpers';
import { error, unauthorized } from '../../utils/response';

export async function getProfile({ store }: Context) {
  try {
    if (!store.user) {
      return unauthorized();
    }

    const userData = await getUserById(store.user.id);

    if (!userData) {
      return error('User not found', 'USER_NOT_FOUND', 404);
    }

    return { data: userData };
  } catch (err) {
    console.error('Error fetching profile:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
