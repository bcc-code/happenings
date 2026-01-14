/**
 * @swagger
 * /admin/collections:
 *   get:
 *     summary: List all collections (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of collections
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     summary: Create a new collection (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - fields
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Collection created
 *       400:
 *         description: Invalid input
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

import type { Context } from 'elysia';
import { error, success } from '../../utils/response';
import {
  createCollection,
  getAllCollections,
  getCollectionByIdOrSlug,
} from '../../services/collection-migration';

export async function listCollections({ store }: Context) {
  try {
    const collections = await getAllCollections();
    return success(collections);
  } catch (err) {
    console.error('Error fetching collections:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function getCollection({ params, store }: Context) {
  try {
    const { id } = params as { id: string };
    const collection = await getCollectionByIdOrSlug(id);

    if (!collection) {
      return error('Collection not found', 'NOT_FOUND', 404);
    }

    return success(collection);
  } catch (err) {
    console.error('Error fetching collection:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function createCollectionHandler({ body, store }: Context) {
  try {
    const input = body as {
      name: string;
      slug: string;
      description?: string;
      fields: Array<{
        name: string;
        slug: string;
        type: 'text' | 'number' | 'boolean' | 'date' | 'json' | 'uuid';
        isRequired?: boolean;
        isUnique?: boolean;
        defaultValue?: string;
      }>;
    };

    if (!input.name || !input.slug || !input.fields || input.fields.length === 0) {
      return error('Name, slug, and fields are required', 'VALIDATION_ERROR', 400);
    }

    if (!store.user?.id) {
      return error('User not found', 'UNAUTHORIZED', 401);
    }

    const collection = await createCollection(input, store.user.id);

    return success(collection, 201);
  } catch (err: any) {
    console.error('Error creating collection:', err);
    return error(
      err.message || 'Internal server error',
      'INTERNAL_ERROR',
      err.message?.includes('already exists') ? 409 : 500
    );
  }
}
