/**
 * @swagger
 * /admin/collections/{id}/items:
 *   get:
 *     summary: Get items from a collection (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of items
 *   post:
 *     summary: Create a new item in a collection (Super Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Item created
 */

import type { Context } from 'elysia';
import { error, success } from '../../utils/response';
import {
  getCollectionByIdOrSlug,
  getCollectionItems,
  getCollectionItemCount,
  getCollectionItem,
  createCollectionItem,
  updateCollectionItem,
  deleteCollectionItem,
} from '../../services/collection-migration';

export async function listCollectionItems({ params, query, store }: Context) {
  try {
    const { id } = params as { id: string };
    const { limit = '100', offset = '0' } = (query as any) || {};

    const collection = await getCollectionByIdOrSlug(id);
    if (!collection) {
      return error('Collection not found', 'NOT_FOUND', 404);
    }

    const items = await getCollectionItems(
      collection.tableName,
      parseInt(limit as string, 10),
      parseInt(offset as string, 10)
    );
    const total = await getCollectionItemCount(collection.tableName);

    return success({
      items,
      total,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });
  } catch (err) {
    console.error('Error fetching collection items:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function getCollectionItemHandler({ params, store }: Context) {
  try {
    const { id, itemId } = params as { id: string; itemId: string };

    const collection = await getCollectionByIdOrSlug(id);
    if (!collection) {
      return error('Collection not found', 'NOT_FOUND', 404);
    }

    const item = await getCollectionItem(collection.tableName, itemId);
    if (!item) {
      return error('Item not found', 'NOT_FOUND', 404);
    }

    return success(item);
  } catch (err) {
    console.error('Error fetching collection item:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function createCollectionItemHandler({ params, body, store }: Context) {
  try {
    const { id } = params as { id: string };
    const data = body as Record<string, any>;

    const collection = await getCollectionByIdOrSlug(id);
    if (!collection) {
      return error('Collection not found', 'NOT_FOUND', 404);
    }

    // Validate required fields
    const requiredFields = collection.fields.filter((f) => f.isRequired);
    for (const field of requiredFields) {
      if (data[field.slug] === undefined || data[field.slug] === null) {
        return error(`Field "${field.name}" is required`, 'VALIDATION_ERROR', 400);
      }
    }

    const item = await createCollectionItem(collection.tableName, data);
    return success(item, 201);
  } catch (err: any) {
    console.error('Error creating collection item:', err);
    return error(
      err.message || 'Internal server error',
      'INTERNAL_ERROR',
      500
    );
  }
}

export async function updateCollectionItemHandler({ params, body, store }: Context) {
  try {
    const { id, itemId } = params as { id: string; itemId: string };
    const data = body as Record<string, any>;

    const collection = await getCollectionByIdOrSlug(id);
    if (!collection) {
      return error('Collection not found', 'NOT_FOUND', 404);
    }

    const item = await updateCollectionItem(collection.tableName, itemId, data);
    if (!item) {
      return error('Item not found', 'NOT_FOUND', 404);
    }

    return success(item);
  } catch (err: any) {
    console.error('Error updating collection item:', err);
    return error(
      err.message || 'Internal server error',
      'INTERNAL_ERROR',
      500
    );
  }
}

export async function deleteCollectionItemHandler({ params, store }: Context) {
  try {
    const { id, itemId } = params as { id: string; itemId: string };

    const collection = await getCollectionByIdOrSlug(id);
    if (!collection) {
      return error('Collection not found', 'NOT_FOUND', 404);
    }

    const item = await deleteCollectionItem(collection.tableName, itemId);
    if (!item) {
      return error('Item not found', 'NOT_FOUND', 404);
    }

    return success({ deleted: true });
  } catch (err) {
    console.error('Error deleting collection item:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
