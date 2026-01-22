/**
 * App (end-user) event endpoints
 */

import type { AuthenticatedContext } from '../../middleware/auth';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { events } from '../../db/schema';
import { error, success } from '../../utils/response';

export async function listAppEvents({ store }: AuthenticatedContext) {
  try {
    const tenantId = store.user?.tenantId;
    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }

    const rows = await db.query.events.findMany({
      where: eq(events.tenantId, tenantId),
      orderBy: [asc(events.startDate)],
    });

    return success(rows);
  } catch (err) {
    console.error('Error listing app events:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function getAppEvent({ params, store }: AuthenticatedContext) {
  try {
    const tenantId = store.user?.tenantId;
    const { id } = params as { id: string };

    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }

    const row = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.tenantId, tenantId)),
    });

    if (!row) {
      return error('Event not found', 'NOT_FOUND', 404);
    }

    return success(row);
  } catch (err) {
    console.error('Error fetching app event:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

