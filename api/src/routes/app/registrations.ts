/**
 * App (end-user) registration endpoints
 */

import type { AuthenticatedContext } from '../../middleware/auth';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '../../db/client';
import { events, registrations } from '../../db/schema';
import { emitCreate, emitUpdate } from '../../events/helpers';
import { error, success } from '../../utils/response';

type CreateRegistrationInput = {
  eventId: string;
};

export async function listMyRegistrations({ store }: AuthenticatedContext) {
  try {
    const tenantId = store.user?.tenantId;
    const userId = store.user?.id;

    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }
    if (!userId) {
      return error('User not found', 'UNAUTHORIZED', 401);
    }

    const rows = await db.query.registrations.findMany({
      where: and(eq(registrations.tenantId, tenantId), eq(registrations.userId, userId)),
      with: {
        event: true,
      },
      orderBy: (registrations, { desc }) => [desc(registrations.registeredAt)],
    });

    return success(rows);
  } catch (err) {
    console.error('Error listing registrations:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function createRegistration({ body, store, request }: AuthenticatedContext) {
  try {
    const tenantId = store.user?.tenantId;
    const userId = store.user?.id;

    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }
    if (!userId) {
      return error('User not found', 'UNAUTHORIZED', 401);
    }

    const input = (body || {}) as Partial<CreateRegistrationInput>;
    if (!input.eventId) {
      return error('eventId is required', 'VALIDATION_ERROR', 400);
    }

    const event = await db.query.events.findFirst({
      where: and(eq(events.id, input.eventId), eq(events.tenantId, tenantId)),
    });
    if (!event) {
      return error('Event not found', 'NOT_FOUND', 404);
    }

    const now = new Date();
    if (event.registrationOpen && now < event.registrationOpen) {
      return error('Registration is not open yet', 'REGISTRATION_NOT_OPEN', 400);
    }
    if (event.registrationClose && now > event.registrationClose) {
      return error('Registration is closed', 'REGISTRATION_CLOSED', 400);
    }

    const existing = await db.query.registrations.findFirst({
      where: and(
        eq(registrations.tenantId, tenantId),
        eq(registrations.eventId, input.eventId),
        eq(registrations.userId, userId),
        ne(registrations.status, 'cancelled')
      ),
    });
    if (existing) {
      return error('Already registered for this event', 'ALREADY_REGISTERED', 409);
    }

    if (event.capacity !== null && event.capacity !== undefined) {
      const activeRegs = await db.query.registrations.findMany({
        where: and(
          eq(registrations.tenantId, tenantId),
          eq(registrations.eventId, input.eventId),
          ne(registrations.status, 'cancelled')
        ),
        columns: { id: true },
      });

      if (activeRegs.length >= event.capacity) {
        return error('Event is full', 'EVENT_FULL', 409);
      }
    }

    const id = crypto.randomUUID();

    const created = await emitCreate(
      'registrations',
      {
        id,
        tenantId,
        userId,
        eventId: input.eventId,
        status: 'pending',
      },
      {
        userId,
        tenantId,
        userRole: store.user?.role,
        userIp: request.headers.get('x-forwarded-for') || undefined,
        entityId: id,
      },
      async (tx, payload) => {
        const txDb = tx as any;
        await txDb.insert(registrations as any).values({
          id: payload.id,
          tenantId: payload.tenantId,
          userId: payload.userId,
          eventId: payload.eventId,
          status: payload.status ?? 'pending',
          registeredAt: new Date(),
        });

        const row = await txDb.query.registrations.findFirst({
          where: and(eq(registrations.id, payload.id), eq(registrations.tenantId, payload.tenantId)),
          with: { event: true },
        });
        if (!row) throw new Error('Failed to create registration');
        return row;
      }
    );

    return success(created, 201);
  } catch (err: any) {
    console.error('Error creating registration:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function cancelRegistration({ params, store, request }: AuthenticatedContext) {
  try {
    const tenantId = store.user?.tenantId;
    const userId = store.user?.id;
    const { id } = params as { id: string };

    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }
    if (!userId) {
      return error('User not found', 'UNAUTHORIZED', 401);
    }

    const existing = await db.query.registrations.findFirst({
      where: and(eq(registrations.id, id), eq(registrations.tenantId, tenantId), eq(registrations.userId, userId)),
      with: { event: true },
    });
    if (!existing) {
      return error('Registration not found', 'NOT_FOUND', 404);
    }

    if (existing.status === 'cancelled') {
      return success(existing);
    }

    const updated = await emitUpdate(
      'registrations',
      { id, tenantId, status: 'cancelled' as const },
      {
        userId,
        tenantId,
        userRole: store.user?.role,
        userIp: request.headers.get('x-forwarded-for') || undefined,
        entityId: id,
      },
      async (tx) => {
        const txDb = tx as any;
        await txDb
          .update(registrations as any)
          .set({ status: 'cancelled' })
          .where(and(eq(registrations.id, id), eq(registrations.tenantId, tenantId), eq(registrations.userId, userId)));

        const row = await txDb.query.registrations.findFirst({
          where: and(eq(registrations.id, id), eq(registrations.tenantId, tenantId), eq(registrations.userId, userId)),
          with: { event: true },
        });
        if (!row) throw new Error('Failed to cancel registration');

        return {
          ...row,
          _auditContext: {
            existingItem: existing as any,
            newItem: row as any,
          },
        } as any;
      }
    );

    const { _auditContext, ...clean } = updated as any;
    return success(clean);
  } catch (err: any) {
    console.error('Error cancelling registration:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}

