/**
 * Multi-tenant context middleware for Elysia
 */

import type { Context } from 'elysia';
import { sql } from '../db/client';
import { unauthorized, error as errorResponse, forbidden } from '../utils/response';

/**
 * Extract and validate tenant context
 */
export async function tenantContext({ request, store }: Context) {
  if (!store.user) {
    return unauthorized();
  }

  // Get tenant ID from:
  // 1. Header (X-Tenant-ID)
  // 2. Query parameter (tenantId)
  // 3. User's primary affiliation
  const url = new URL(request.url);
  let tenantId = 
    request.headers.get('x-tenant-id') ||
    url.searchParams.get('tenantId') ||
    store.user.affiliations?.find((aff) => aff.isPrimary)?.tenantId;

  if (!tenantId) {
    return errorResponse('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
  }

  // Verify user has access to this tenant
  const hasAccess = store.user.affiliations?.some(
    (aff) => aff.tenantId === tenantId
  );

  if (!hasAccess) {
    return forbidden('Access denied to this tenant');
  }

  // Verify tenant exists and is active
  const tenants = await sql`
    SELECT * FROM "Tenant"
    WHERE id = ${tenantId} AND "isActive" = true
    LIMIT 1
  `;

  if (tenants.length === 0) {
    return errorResponse('Tenant not found or inactive', 'TENANT_NOT_FOUND', 404);
  }

  // Set tenant context
  store.user.tenantId = tenantId;
  store.user.role = store.user.affiliations?.find(
    (aff) => aff.tenantId === tenantId
  )?.role || 'user';

  // Attach tenant to store for easy access
  store.tenant = tenants[0];
}
