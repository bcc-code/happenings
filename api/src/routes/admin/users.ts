/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users for a tenant (Admin)
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
 *         description: List of users
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
import type { AuthenticatedContext } from '../../middleware/auth';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { users, userAffiliations } from '../../db/schema';
import { error, success } from '../../utils/response';

export async function listUsers({ store, query }: AuthenticatedContext) {
  try {
    const tenantId = store.user?.tenantId;
    
    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }

    // Get search query parameter
    const search = (query as any)?.search as string | undefined;
    
    // Get users with affiliations for this tenant
    const userAffiliationRows = await db.query.userAffiliations.findMany({
      where: eq(userAffiliations.tenantId, tenantId),
      with: {
        user: true,
      },
      orderBy: [desc(userAffiliations.joinedAt)],
    });

    // Filter by search if provided
    let filteredRows = userAffiliationRows;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRows = userAffiliationRows.filter((aff) => {
        const user = aff.user;
        return (
          user.email.toLowerCase().includes(searchLower) ||
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchLower)
        );
      });
    }

    // Format response to include user data with affiliation info
    const formattedUsers = filteredRows.map((aff) => ({
      id: aff.user.id,
      auth0Id: aff.user.auth0Id,
      email: aff.user.email,
      emailVerified: aff.user.emailVerified,
      firstName: aff.user.firstName,
      lastName: aff.user.lastName,
      phone: aff.user.phone,
      avatarUrl: aff.user.avatarUrl,
      timezone: aff.user.timezone,
      locale: aff.user.locale,
      createdAt: aff.user.createdAt,
      updatedAt: aff.user.updatedAt,
      lastLoginAt: aff.user.lastLoginAt,
      // Affiliation data
      affiliationId: aff.id,
      role: aff.role,
      isPrimary: aff.isPrimary,
      status: aff.status,
      joinedAt: aff.joinedAt,
      lastActiveAt: aff.lastActiveAt,
    }));

    return success(formattedUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get a user (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User
 */
export async function getUser({ params, store }: AuthenticatedContext) {
  try {
    const tenantId = store.user?.tenantId;
    const { id } = params as { id: string };

    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }

    // Get user affiliation for this tenant
    const affiliation = await db.query.userAffiliations.findFirst({
      where: and(
        eq(userAffiliations.userId, id),
        eq(userAffiliations.tenantId, tenantId)
      ),
      with: {
        user: true,
      },
    });

    if (!affiliation) {
      return error('User not found', 'NOT_FOUND', 404);
    }

    const formattedUser = {
      id: affiliation.user.id,
      auth0Id: affiliation.user.auth0Id,
      email: affiliation.user.email,
      emailVerified: affiliation.user.emailVerified,
      firstName: affiliation.user.firstName,
      lastName: affiliation.user.lastName,
      phone: affiliation.user.phone,
      avatarUrl: affiliation.user.avatarUrl,
      timezone: affiliation.user.timezone,
      locale: affiliation.user.locale,
      createdAt: affiliation.user.createdAt,
      updatedAt: affiliation.user.updatedAt,
      lastLoginAt: affiliation.user.lastLoginAt,
      // Affiliation data
      affiliationId: affiliation.id,
      role: affiliation.role,
      isPrimary: affiliation.isPrimary,
      status: affiliation.status,
      joinedAt: affiliation.joinedAt,
      lastActiveAt: affiliation.lastActiveAt,
    };

    return success(formattedUser);
  } catch (err) {
    console.error('Error fetching user:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update a user's affiliation (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-ID
 *         required: true
 *         schema:
 *           type: string
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
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin, event_manager, user]
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 */
export async function updateUser({ params, body, store }: AuthenticatedContext) {
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

    // Verify user affiliation exists
    const affiliation = await db.query.userAffiliations.findFirst({
      where: and(
        eq(userAffiliations.userId, id),
        eq(userAffiliations.tenantId, tenantId)
      ),
      with: {
        user: true,
      },
    });

    if (!affiliation) {
      return error('User not found', 'NOT_FOUND', 404);
    }

    const input = (body || {}) as {
      firstName?: string;
      lastName?: string;
      phone?: string;
      role?: string;
      status?: string;
      isPrimary?: boolean;
    };

    // Update user fields if provided
    const userUpdates: Record<string, any> = {
      updatedAt: new Date(),
    };
    if (input.firstName !== undefined) userUpdates.firstName = input.firstName || null;
    if (input.lastName !== undefined) userUpdates.lastName = input.lastName || null;
    if (input.phone !== undefined) userUpdates.phone = input.phone || null;

    if (Object.keys(userUpdates).length > 1) {
      await db
        .update(users)
        .set(userUpdates)
        .where(eq(users.id, id));
    }

    // Update affiliation fields if provided
    const affiliationUpdates: Record<string, any> = {};
    if (input.role !== undefined) {
      if (!['super_admin', 'admin', 'event_manager', 'user'].includes(input.role)) {
        return error('Invalid role', 'VALIDATION_ERROR', 400);
      }
      affiliationUpdates.role = input.role;
    }
    if (input.status !== undefined) {
      if (!['active', 'inactive'].includes(input.status)) {
        return error('Invalid status', 'VALIDATION_ERROR', 400);
      }
      affiliationUpdates.status = input.status;
    }
    if (input.isPrimary !== undefined) {
      affiliationUpdates.isPrimary = input.isPrimary;
    }

    if (Object.keys(affiliationUpdates).length > 0) {
      await db
        .update(userAffiliations)
        .set(affiliationUpdates)
        .where(eq(userAffiliations.id, affiliation.id));
    }

    // Fetch updated data
    const updatedAffiliation = await db.query.userAffiliations.findFirst({
      where: eq(userAffiliations.id, affiliation.id),
      with: {
        user: true,
      },
    });

    if (!updatedAffiliation) {
      return error('Failed to update user', 'INTERNAL_ERROR', 500);
    }

    const formattedUser = {
      id: updatedAffiliation.user.id,
      auth0Id: updatedAffiliation.user.auth0Id,
      email: updatedAffiliation.user.email,
      emailVerified: updatedAffiliation.user.emailVerified,
      firstName: updatedAffiliation.user.firstName,
      lastName: updatedAffiliation.user.lastName,
      phone: updatedAffiliation.user.phone,
      avatarUrl: updatedAffiliation.user.avatarUrl,
      timezone: updatedAffiliation.user.timezone,
      locale: updatedAffiliation.user.locale,
      createdAt: updatedAffiliation.user.createdAt,
      updatedAt: updatedAffiliation.user.updatedAt,
      lastLoginAt: updatedAffiliation.user.lastLoginAt,
      // Affiliation data
      affiliationId: updatedAffiliation.id,
      role: updatedAffiliation.role,
      isPrimary: updatedAffiliation.isPrimary,
      status: updatedAffiliation.status,
      joinedAt: updatedAffiliation.joinedAt,
      lastActiveAt: updatedAffiliation.lastActiveAt,
    };

    return success(formattedUser);
  } catch (err: any) {
    console.error('Error updating user:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Remove user affiliation from tenant (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User affiliation removed
 */
export async function deleteUser({ params, store }: AuthenticatedContext) {
  try {
    const tenantId = store.user?.tenantId;
    const { id } = params as { id: string };

    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }

    // Find affiliation
    const affiliation = await db.query.userAffiliations.findFirst({
      where: and(
        eq(userAffiliations.userId, id),
        eq(userAffiliations.tenantId, tenantId)
      ),
    });

    if (!affiliation) {
      return error('User not found', 'NOT_FOUND', 404);
    }

    // Delete affiliation (this removes the user from the tenant, not the user itself)
    await db
      .delete(userAffiliations)
      .where(eq(userAffiliations.id, affiliation.id));

    return success({ deleted: true });
  } catch (err: any) {
    console.error('Error deleting user affiliation:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}
