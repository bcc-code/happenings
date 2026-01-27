/**
 * @swagger
 * /admin/groups:
 *   get:
 *     summary: List all family groups for a tenant (Admin)
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
 *         description: List of family groups
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
import type { AuthenticatedContext } from '../../middleware/auth';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { familyGroups, familyGroupMembers, users } from '../../db/schema';
import { error, success } from '../../utils/response';

export async function listGroups({ store, query }: AuthenticatedContext) {
  try {
    const tenantId = store.user?.tenantId;
    
    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }

    // Get search query parameter
    const search = (query as any)?.search as string | undefined;
    
    // Get all family groups for this tenant
    const groups = await db.query.familyGroups.findMany({
      where: eq(familyGroups.tenantId, tenantId),
      with: {
        primaryContact: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        members: {
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
        },
      },
      orderBy: [desc(familyGroups.createdAt)],
    });

    // Filter by search if provided
    let filteredGroups = groups;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredGroups = groups.filter((group) => {
        const primaryContact = group.primaryContact;
        const nameMatch = group.name?.toLowerCase().includes(searchLower);
        const emailMatch = primaryContact.email.toLowerCase().includes(searchLower);
        const nameMatch2 = primaryContact.firstName?.toLowerCase().includes(searchLower);
        const nameMatch3 = primaryContact.lastName?.toLowerCase().includes(searchLower);
        return nameMatch || emailMatch || nameMatch2 || nameMatch3;
      });
    }

    return success(filteredGroups);
  } catch (err) {
    console.error('Error fetching groups:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * @swagger
 * /admin/groups/{id}:
 *   get:
 *     summary: Get a family group (Admin)
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
 *         description: Family group
 */
export async function getGroup({ params, store }: AuthenticatedContext) {
  try {
    const tenantId = store.user?.tenantId;
    const { id } = params as { id: string };

    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }

    const group = await db.query.familyGroups.findFirst({
      where: and(
        eq(familyGroups.id, id),
        eq(familyGroups.tenantId, tenantId)
      ),
      with: {
        primaryContact: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        members: {
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
        },
      },
    });

    if (!group) {
      return error('Family group not found', 'NOT_FOUND', 404);
    }

    return success(group);
  } catch (err) {
    console.error('Error fetching group:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * @swagger
 * /admin/groups:
 *   post:
 *     summary: Create a family group (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [primaryContactId]
 *             properties:
 *               name:
 *                 type: string
 *               primaryContactId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Family group created
 */
export async function createGroup({ body, store }: AuthenticatedContext) {
  try {
    const tenantId = store.user?.tenantId;
    const userId = store.user?.id;

    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }
    if (!userId) {
      return error('User not found', 'UNAUTHORIZED', 401);
    }

    const input = (body || {}) as {
      name?: string;
      primaryContactId: string;
    };

    if (!input.primaryContactId) {
      return error('primaryContactId is required', 'VALIDATION_ERROR', 400);
    }

    // Verify primary contact exists and has affiliation with tenant
    const affiliation = await db.query.userAffiliations.findFirst({
      where: and(
        eq(userAffiliations.userId, input.primaryContactId),
        eq(userAffiliations.tenantId, tenantId)
      ),
    });

    if (!affiliation) {
      return error('Primary contact must be affiliated with this tenant', 'VALIDATION_ERROR', 400);
    }

    // Name validation
    if (input.name && input.name.length > 255) {
      return error('Name must be 255 characters or less', 'VALIDATION_ERROR', 400);
    }

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(familyGroups)
      .values({
        id,
        tenantId,
        name: input.name || null,
        primaryContactId: input.primaryContactId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Add primary contact as a member
    await db.insert(familyGroupMembers).values({
      id: crypto.randomUUID(),
      familyGroupId: id,
      userId: input.primaryContactId,
      relationshipType: 'primary',
      isPrimaryContact: true,
      addedAt: new Date(),
      addedBy: userId,
    });

    // Fetch complete group with relations
    const group = await db.query.familyGroups.findFirst({
      where: eq(familyGroups.id, id),
      with: {
        primaryContact: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        members: {
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
        },
      },
    });

    if (!group) {
      return error('Failed to create family group', 'INTERNAL_ERROR', 500);
    }

    return success(group, 201);
  } catch (err: any) {
    console.error('Error creating group:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * @swagger
 * /admin/groups/{id}:
 *   put:
 *     summary: Update a family group (Admin)
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
 *               name:
 *                 type: string
 *               primaryContactId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Family group updated
 */
export async function updateGroup({ params, body, store }: AuthenticatedContext) {
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

    const existing = await db.query.familyGroups.findFirst({
      where: and(
        eq(familyGroups.id, id),
        eq(familyGroups.tenantId, tenantId)
      ),
    });

    if (!existing) {
      return error('Family group not found', 'NOT_FOUND', 404);
    }

    const input = (body || {}) as {
      name?: string;
      primaryContactId?: string;
    };

    // Name validation
    if (input.name !== undefined) {
      if (input.name && input.name.length > 255) {
        return error('Name must be 255 characters or less', 'VALIDATION_ERROR', 400);
      }
    }

    // Primary contact validation
    if (input.primaryContactId !== undefined) {
      if (!input.primaryContactId) {
        return error('primaryContactId cannot be empty', 'VALIDATION_ERROR', 400);
      }

      // Verify new primary contact exists and has affiliation with tenant
      const affiliation = await db.query.userAffiliations.findFirst({
        where: and(
          eq(userAffiliations.userId, input.primaryContactId),
          eq(userAffiliations.tenantId, tenantId)
        ),
      });

      if (!affiliation) {
        return error('Primary contact must be affiliated with this tenant', 'VALIDATION_ERROR', 400);
      }

      // Update primary contact in members table
      await db
        .update(familyGroupMembers)
        .set({ isPrimaryContact: false })
        .where(eq(familyGroupMembers.familyGroupId, id));

      // Check if new primary contact is already a member
      const existingMember = await db.query.familyGroupMembers.findFirst({
        where: and(
          eq(familyGroupMembers.familyGroupId, id),
          eq(familyGroupMembers.userId, input.primaryContactId)
        ),
      });

      if (existingMember) {
        // Update existing member
        await db
          .update(familyGroupMembers)
          .set({ isPrimaryContact: true })
          .where(eq(familyGroupMembers.id, existingMember.id));
      } else {
        // Add as new member
        await db.insert(familyGroupMembers).values({
          id: crypto.randomUUID(),
          familyGroupId: id,
          userId: input.primaryContactId,
          relationshipType: 'primary',
          isPrimaryContact: true,
          addedAt: new Date(),
          addedBy: userId,
        });
      }
    }

    // Update group fields
    const updates: Record<string, any> = {
      updatedAt: new Date(),
    };
    if (input.name !== undefined) updates.name = input.name || null;
    if (input.primaryContactId !== undefined) updates.primaryContactId = input.primaryContactId;

    await db
      .update(familyGroups)
      .set(updates)
      .where(eq(familyGroups.id, id));

    // Fetch updated group
    const group = await db.query.familyGroups.findFirst({
      where: eq(familyGroups.id, id),
      with: {
        primaryContact: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        members: {
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
        },
      },
    });

    if (!group) {
      return error('Failed to update family group', 'INTERNAL_ERROR', 500);
    }

    return success(group);
  } catch (err: any) {
    console.error('Error updating group:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * @swagger
 * /admin/groups/{id}:
 *   delete:
 *     summary: Delete a family group (Admin)
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
 *         description: Family group deleted
 */
export async function deleteGroup({ params, store }: AuthenticatedContext) {
  try {
    const tenantId = store.user?.tenantId;
    const { id } = params as { id: string };

    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }

    const existing = await db.query.familyGroups.findFirst({
      where: and(
        eq(familyGroups.id, id),
        eq(familyGroups.tenantId, tenantId)
      ),
    });

    if (!existing) {
      return error('Family group not found', 'NOT_FOUND', 404);
    }

    // Delete members first (cascade should handle this, but being explicit)
    await db
      .delete(familyGroupMembers)
      .where(eq(familyGroupMembers.familyGroupId, id));

    // Delete group
    await db
      .delete(familyGroups)
      .where(eq(familyGroups.id, id));

    return success({ deleted: true });
  } catch (err: any) {
    console.error('Error deleting group:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * @swagger
 * /admin/groups/{id}/members:
 *   post:
 *     summary: Add a member to a family group (Admin)
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
 *             required: [userId, relationshipType]
 *             properties:
 *               userId:
 *                 type: string
 *               relationshipType:
 *                 type: string
 *                 enum: [parent, child, spouse, guardian, sibling, other]
 *     responses:
 *       201:
 *         description: Member added
 */
export async function addGroupMember({ params, body, store }: AuthenticatedContext) {
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

    const group = await db.query.familyGroups.findFirst({
      where: and(
        eq(familyGroups.id, id),
        eq(familyGroups.tenantId, tenantId)
      ),
    });

    if (!group) {
      return error('Family group not found', 'NOT_FOUND', 404);
    }

    const input = (body || {}) as {
      userId: string;
      relationshipType: string;
    };

    if (!input.userId || !input.relationshipType) {
      return error('userId and relationshipType are required', 'VALIDATION_ERROR', 400);
    }

    const validRelationshipTypes = ['parent', 'child', 'spouse', 'guardian', 'sibling', 'other'];
    if (!validRelationshipTypes.includes(input.relationshipType)) {
      return error('Invalid relationshipType', 'VALIDATION_ERROR', 400);
    }

    // Verify user exists and has affiliation with tenant
    const affiliation = await db.query.userAffiliations.findFirst({
      where: and(
        eq(userAffiliations.userId, input.userId),
        eq(userAffiliations.tenantId, tenantId)
      ),
    });

    if (!affiliation) {
      return error('User must be affiliated with this tenant', 'VALIDATION_ERROR', 400);
    }

    // Check if member already exists
    const existingMember = await db.query.familyGroupMembers.findFirst({
      where: and(
        eq(familyGroupMembers.familyGroupId, id),
        eq(familyGroupMembers.userId, input.userId)
      ),
    });

    if (existingMember) {
      return error('User is already a member of this group', 'VALIDATION_ERROR', 400);
    }

    // Add member
    await db.insert(familyGroupMembers).values({
      id: crypto.randomUUID(),
      familyGroupId: id,
      userId: input.userId,
      relationshipType: input.relationshipType,
      isPrimaryContact: false,
      addedAt: new Date(),
      addedBy: userId,
    });

    // Fetch updated group
    const updatedGroup = await db.query.familyGroups.findFirst({
      where: eq(familyGroups.id, id),
      with: {
        primaryContact: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        members: {
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
        },
      },
    });

    return success(updatedGroup, 201);
  } catch (err: any) {
    console.error('Error adding group member:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}

/**
 * @swagger
 * /admin/groups/{id}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from a family group (Admin)
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
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed
 */
export async function removeGroupMember({ params, store }: AuthenticatedContext) {
  try {
    const tenantId = store.user?.tenantId;
    const { id, memberId } = params as { id: string; memberId: string };

    if (!tenantId) {
      return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
    }

    // Verify group exists
    const group = await db.query.familyGroups.findFirst({
      where: and(
        eq(familyGroups.id, id),
        eq(familyGroups.tenantId, tenantId)
      ),
    });

    if (!group) {
      return error('Family group not found', 'NOT_FOUND', 404);
    }

    // Verify member exists
    const member = await db.query.familyGroupMembers.findFirst({
      where: and(
        eq(familyGroupMembers.id, memberId),
        eq(familyGroupMembers.familyGroupId, id)
      ),
    });

    if (!member) {
      return error('Member not found', 'NOT_FOUND', 404);
    }

    // Don't allow removing primary contact
    if (member.isPrimaryContact) {
      return error('Cannot remove primary contact. Change primary contact first.', 'VALIDATION_ERROR', 400);
    }

    // Remove member
    await db
      .delete(familyGroupMembers)
      .where(eq(familyGroupMembers.id, memberId));

    return success({ deleted: true });
  } catch (err: any) {
    console.error('Error removing group member:', err);
    return error(err?.message || 'Internal server error', 'INTERNAL_ERROR', 500);
  }
}
