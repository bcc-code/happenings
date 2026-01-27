/**
 * Super-admin event management endpoints (tenant chosen via path param)
 */

import type { Context } from 'elysia';
import type { AuthenticatedContext } from '../../middleware/auth';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { events, registrations, tenants, users } from '../../db/schema';
import { emitCreate, emitDelete, emitUpdate } from '../../events/helpers';
import { error, success } from '../../utils/response';
import { getAuditLogsForItem } from '../../utils/audit';

type EventInput = {
  title: string;
  description?: string | null;
  startDate: string; // ISO
  endDate: string; // ISO
  venue?: string | null;
  capacity?: number | null;
  registrationOpen?: string | null; // ISO
  registrationClose?: string | null; // ISO
  isGlobal?: boolean | null;
  globalAccessRules?: unknown | null;
};

async function requireTenant(tenantId: string) {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });
  return tenant;
}

export async function listTenantEvents({ params }: Context) {
  try {
    const { tenantId } = params as { tenantId: string };
    const tenant = await requireTenant(tenantId);
    if (!tenant) return error('Tenant not found', 'NOT_FOUND', 404);

    const rows = await db.query.events.findMany({
      where: eq(events.tenantId, tenantId),
      orderBy: [desc(events.startDate)],
    });

    return success({ tenant, events: rows });
  } catch (err) {
    console.error('Error listing tenant events:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function getTenantEvent({ params }: Context) {
  try {
    const { tenantId, id } = params as { tenantId: string; id: string };
    const tenant = await requireTenant(tenantId);
    if (!tenant) return error('Tenant not found', 'NOT_FOUND', 404);

    const row = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.tenantId, tenantId)),
    });
    if (!row) return error('Event not found', 'NOT_FOUND', 404);

    return success({ tenant, event: row });
  } catch (err) {
    console.error('Error fetching tenant event:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function createTenantEvent({ params, body, store, request }: AuthenticatedContext) {
  try {
    const { tenantId } = params as { tenantId: string };
    const tenant = await requireTenant(tenantId);
    if (!tenant) return error('Tenant not found', 'NOT_FOUND', 404);

    const userId = store.user?.id;
    if (!userId) return error('User not found', 'UNAUTHORIZED', 401);

    const input = (body || {}) as Partial<EventInput>;
    if (!input.title || !input.startDate || !input.endDate) {
      return error('title, startDate, and endDate are required', 'VALIDATION_ERROR', 400);
    }

    // Title validation
    if (input.title.length > 255) {
      return error('Title must be 255 characters or less', 'VALIDATION_ERROR', 400);
    }
    if (input.title.trim().length === 0) {
      return error('Title cannot be empty', 'VALIDATION_ERROR', 400);
    }

    // Date validation
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return error('Invalid startDate or endDate', 'VALIDATION_ERROR', 400);
    }
    if (endDate < startDate) {
      return error('endDate must be after startDate', 'VALIDATION_ERROR', 400);
    }

    // Capacity validation
    if (input.capacity !== null && input.capacity !== undefined) {
      if (!Number.isInteger(input.capacity) || input.capacity < 0) {
        return error('Capacity must be a non-negative integer', 'VALIDATION_ERROR', 400);
      }
    }

    // Venue validation
    if (input.venue && input.venue.length > 255) {
      return error('Venue must be 255 characters or less', 'VALIDATION_ERROR', 400);
    }

    // Registration window validation
    const registrationOpen = input.registrationOpen ? new Date(input.registrationOpen) : null;
    const registrationClose = input.registrationClose ? new Date(input.registrationClose) : null;

    if (registrationOpen && Number.isNaN(registrationOpen.getTime())) {
      return error('Invalid registrationOpen date', 'VALIDATION_ERROR', 400);
    }
    if (registrationClose && Number.isNaN(registrationClose.getTime())) {
      return error('Invalid registrationClose date', 'VALIDATION_ERROR', 400);
    }

    if (registrationOpen && registrationClose) {
      if (registrationClose < registrationOpen) {
        return error('registrationClose must be after registrationOpen', 'VALIDATION_ERROR', 400);
      }
      if (registrationClose > startDate) {
        return error('registrationClose must be before or equal to event startDate', 'VALIDATION_ERROR', 400);
      }
    } else if (registrationOpen && !registrationClose) {
      if (registrationOpen > startDate) {
        return error('registrationOpen must be before or equal to event startDate', 'VALIDATION_ERROR', 400);
      }
    } else if (registrationClose && !registrationOpen) {
      if (registrationClose > startDate) {
        return error('registrationClose must be before or equal to event startDate', 'VALIDATION_ERROR', 400);
      }
    }

    const id = crypto.randomUUID();

    const created = await emitCreate(
      'events',
      {
        id,
        tenantId,
        ...input,
        startDate,
        endDate,
        registrationOpen,
        registrationClose,
        isGlobal: Boolean(input.isGlobal),
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
        await txDb.insert(events as any).values({
          id: payload.id,
          tenantId: payload.tenantId,
          title: payload.title,
          description: payload.description ?? null,
          startDate: payload.startDate,
          endDate: payload.endDate,
          venue: payload.venue ?? null,
          capacity: payload.capacity ?? null,
          registrationOpen: payload.registrationOpen ?? null,
          registrationClose: payload.registrationClose ?? null,
          isGlobal: Boolean(payload.isGlobal),
          globalAccessRules: (payload as any).globalAccessRules ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const row = await txDb.query.events.findFirst({
          where: and(eq(events.id, payload.id), eq(events.tenantId, payload.tenantId)),
        });
        if (!row) throw new Error('Failed to create event');
        return row;
      }
    );

    return success({ tenant, event: created }, 201);
  } catch (err: any) {
    console.error('Error creating tenant event:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function updateTenantEvent({ params, body, store, request }: AuthenticatedContext) {
  try {
    const { tenantId, id } = params as { tenantId: string; id: string };
    const tenant = await requireTenant(tenantId);
    if (!tenant) return error('Tenant not found', 'NOT_FOUND', 404);

    const userId = store.user?.id;
    if (!userId) return error('User not found', 'UNAUTHORIZED', 401);

    const existing = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.tenantId, tenantId)),
    });
    if (!existing) return error('Event not found', 'NOT_FOUND', 404);

    const input = (body || {}) as Partial<EventInput>;

    // Title validation (if provided)
    if (input.title !== undefined) {
      if (!input.title || input.title.trim().length === 0) {
        return error('Title cannot be empty', 'VALIDATION_ERROR', 400);
      }
      if (input.title.length > 255) {
        return error('Title must be 255 characters or less', 'VALIDATION_ERROR', 400);
      }
    }

    // Date validation
    const startDate = input.startDate ? new Date(input.startDate) : undefined;
    const endDate = input.endDate ? new Date(input.endDate) : undefined;
    if (startDate && Number.isNaN(startDate.getTime())) return error('Invalid startDate', 'VALIDATION_ERROR', 400);
    if (endDate && Number.isNaN(endDate.getTime())) return error('Invalid endDate', 'VALIDATION_ERROR', 400);

    const nextStart = startDate ?? existing.startDate;
    const nextEnd = endDate ?? existing.endDate;
    if (nextEnd < nextStart) return error('endDate must be after startDate', 'VALIDATION_ERROR', 400);

    // Capacity validation (if provided)
    if (input.capacity !== null && input.capacity !== undefined) {
      if (!Number.isInteger(input.capacity) || input.capacity < 0) {
        return error('Capacity must be a non-negative integer', 'VALIDATION_ERROR', 400);
      }
    }

    // Venue validation (if provided)
    if (input.venue !== undefined && input.venue && input.venue.length > 255) {
      return error('Venue must be 255 characters or less', 'VALIDATION_ERROR', 400);
    }

    // Registration window validation
    const registrationOpen = input.registrationOpen ? new Date(input.registrationOpen) : (input.registrationOpen === null ? null : undefined);
    const registrationClose = input.registrationClose ? new Date(input.registrationClose) : (input.registrationClose === null ? null : undefined);

    if (registrationOpen !== undefined && registrationOpen !== null && Number.isNaN(registrationOpen.getTime())) {
      return error('Invalid registrationOpen date', 'VALIDATION_ERROR', 400);
    }
    if (registrationClose !== undefined && registrationClose !== null && Number.isNaN(registrationClose.getTime())) {
      return error('Invalid registrationClose date', 'VALIDATION_ERROR', 400);
    }

    const finalRegistrationOpen = registrationOpen !== undefined ? registrationOpen : existing.registrationOpen;
    const finalRegistrationClose = registrationClose !== undefined ? registrationClose : existing.registrationClose;

    if (finalRegistrationOpen && finalRegistrationClose) {
      if (finalRegistrationClose < finalRegistrationOpen) {
        return error('registrationClose must be after registrationOpen', 'VALIDATION_ERROR', 400);
      }
      if (finalRegistrationClose > nextStart) {
        return error('registrationClose must be before or equal to event startDate', 'VALIDATION_ERROR', 400);
      }
    } else if (finalRegistrationOpen && !finalRegistrationClose) {
      if (finalRegistrationOpen > nextStart) {
        return error('registrationOpen must be before or equal to event startDate', 'VALIDATION_ERROR', 400);
      }
    } else if (finalRegistrationClose && !finalRegistrationOpen) {
      if (finalRegistrationClose > nextStart) {
        return error('registrationClose must be before or equal to event startDate', 'VALIDATION_ERROR', 400);
      }
    }

    const updated = await emitUpdate(
      'events',
      {
        id,
        tenantId,
        ...input,
        startDate: nextStart,
        endDate: nextEnd,
        registrationOpen: finalRegistrationOpen,
        registrationClose: finalRegistrationClose,
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
        const updateValues: Record<string, any> = { updatedAt: new Date() };
        if (payload.title !== undefined) updateValues.title = payload.title;
        if (payload.description !== undefined) updateValues.description = payload.description;
        if (payload.startDate !== undefined) updateValues.startDate = payload.startDate;
        if (payload.endDate !== undefined) updateValues.endDate = payload.endDate;
        if (payload.venue !== undefined) updateValues.venue = payload.venue;
        if (payload.capacity !== undefined) updateValues.capacity = payload.capacity;
        if (payload.registrationOpen !== undefined) updateValues.registrationOpen = payload.registrationOpen;
        if (payload.registrationClose !== undefined) updateValues.registrationClose = payload.registrationClose;
        if ((payload as any).isGlobal !== undefined) updateValues.isGlobal = Boolean((payload as any).isGlobal);
        if ((payload as any).globalAccessRules !== undefined) updateValues.globalAccessRules = (payload as any).globalAccessRules;

        await txDb
          .update(events as any)
          .set(updateValues)
          .where(and(eq(events.id, id), eq(events.tenantId, tenantId)));

        const row = await txDb.query.events.findFirst({
          where: and(eq(events.id, id), eq(events.tenantId, tenantId)),
        });
        if (!row) throw new Error('Failed to update event');

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
    return success({ tenant, event: clean });
  } catch (err: any) {
    console.error('Error updating tenant event:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function deleteTenantEvent({ params, store, request }: AuthenticatedContext) {
  try {
    const { tenantId, id } = params as { tenantId: string; id: string };
    const tenant = await requireTenant(tenantId);
    if (!tenant) return error('Tenant not found', 'NOT_FOUND', 404);

    const userId = store.user?.id;
    if (!userId) return error('User not found', 'UNAUTHORIZED', 401);

    const existing = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.tenantId, tenantId)),
    });
    if (!existing) return error('Event not found', 'NOT_FOUND', 404);

    await emitDelete(
      'events',
      existing,
      {
        userId,
        tenantId,
        userRole: store.user?.role,
        userIp: request.headers.get('x-forwarded-for') || undefined,
        entityId: id,
      },
      async (tx) => {
        const txDb = tx as any;
        await txDb.delete(events as any).where(and(eq(events.id, id), eq(events.tenantId, tenantId)));
        return existing;
      }
    );

    return success({ deleted: true });
  } catch (err: any) {
    console.error('Error deleting tenant event:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function listTenantEventRegistrations({ params }: Context) {
  try {
    const { tenantId, id } = params as { tenantId: string; id: string };
    const tenant = await requireTenant(tenantId);
    if (!tenant) return error('Tenant not found', 'NOT_FOUND', 404);

    const event = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.tenantId, tenantId)),
    });
    if (!event) return error('Event not found', 'NOT_FOUND', 404);

    const rows = await db.query.registrations.findMany({
      where: and(eq(registrations.tenantId, tenantId), eq(registrations.eventId, id)),
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: (registrations, { desc }) => [desc(registrations.registeredAt)],
    });

    return success({ tenant, event, registrations: rows });
  } catch (err: any) {
    console.error('Error listing tenant event registrations:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function getTenantEventAuditLogs({ params }: Context) {
  try {
    const { tenantId, id } = params as { tenantId: string; id: string };

    // Verify tenant exists
    const tenant = await requireTenant(tenantId);
    if (!tenant) {
      return error('Tenant not found', 'NOT_FOUND', 404);
    }

    // Verify event exists and belongs to tenant
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.tenantId, tenantId)),
    });
    if (!event) {
      return error('Event not found', 'NOT_FOUND', 404);
    }

    // Get audit logs for this event
    const logs = await getAuditLogsForItem('events', id, 100);

    // Fetch user information for each log entry
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const user = await db.query.users.findFirst({
          where: eq(users.id, log.userId),
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        });

        return {
          ...log,
          user: user || null,
        };
      })
    );

    return success({
      event: {
        id: event.id,
        title: event.title,
      },
      logs: logsWithUsers,
    });
  } catch (err: any) {
    console.error('Error fetching event audit logs:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}

