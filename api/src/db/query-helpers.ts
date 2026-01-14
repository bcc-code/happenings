/**
 * Query helpers using Drizzle ORM
 */

import { db } from './client';
import { users, userAffiliations, events } from './schema';
import { eq, and } from 'drizzle-orm';

/**
 * Get user by auth0Id with affiliations
 */
export async function getUserWithAffiliations(auth0Id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.auth0Id, auth0Id),
    with: {
      affiliations: {
        where: eq(userAffiliations.status, 'active'),
        with: {
          tenant: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    ...user,
    affiliations: user.affiliations.map((aff) => ({
      tenantId: aff.tenantId,
      role: aff.role,
      isPrimary: aff.isPrimary,
    })),
  };
}

/**
 * Get events for tenant
 */
export async function getEventsForTenant(tenantId: string) {
  return await db.query.events.findMany({
    where: eq(events.tenantId, tenantId),
    orderBy: (events, { desc }) => [desc(events.startDate)],
  });
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      timezone: true,
      locale: true,
    },
  });
}
