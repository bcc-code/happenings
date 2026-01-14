/**
 * Authentication and Authorization Middleware for Elysia
 */

import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import type { Context } from 'elysia';
import { config } from '../config';
import { getUserWithAffiliations } from '../db/query-helpers';
import { unauthorized, forbidden, error } from '../utils/response';

// Extend Elysia Context type
export interface AuthenticatedContext extends Context {
  store: {
    user?: {
      id: string;
      auth0Id: string;
      email: string;
      tenantId?: string;
      role?: string;
      affiliations?: Array<{
        tenantId: string;
        role: string;
        isPrimary: boolean;
      }>;
    };
  };
}

// JWKS client for Auth0
const client = jwksClient({
  jwksUri: `https://${config.auth0.domain}/.well-known/jwks.json`,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
}

/**
 * Verify JWT token from Auth0
 */
export async function verifyToken({ request, store }: Context) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized('No token provided');
    }

    const token = authHeader.substring(7);

    await new Promise<void>((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          audience: config.auth0.audience,
          issuer: config.auth0.issuer,
          algorithms: ['RS256'],
        },
        async (err, decoded) => {
          if (err || !decoded || typeof decoded === 'string') {
            reject(new Error('Invalid token'));
            return;
          }

          const auth0Id = decoded.sub as string;
          
          // Get user from database using native postgres
          const user = await getUserWithAffiliations(auth0Id);

          if (!user) {
            reject(new Error('User not found'));
            return;
          }

          // Attach user to store
          store.user = {
            id: user.id,
            auth0Id: user.auth0Id as string,
            email: user.email as string,
            affiliations: (user.affiliations as any[]) || [],
          };

          resolve();
        }
      );
    });
  } catch (error) {
    return unauthorized('Authentication failed');
  }
}

/**
 * Require authentication (user must be logged in)
 */
export async function requireAuth({ store }: Context) {
  if (!store.user) {
    return unauthorized();
  }
}

/**
 * Require admin role for specific tenant
 */
export async function requireAdmin({ request, store }: Context) {
  if (!store.user) {
    return unauthorized();
  }

  const targetTenantId = request.headers.get('x-tenant-id') || 
    new URL(request.url).searchParams.get('tenantId');

  if (!targetTenantId) {
    return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
  }

  // Check if user has admin role for this tenant
  const affiliation = store.user.affiliations?.find(
    (aff) => aff.tenantId === targetTenantId && 
    ['super_admin', 'admin', 'event_manager'].includes(aff.role)
  );

  if (!affiliation) {
    return forbidden('Admin access required');
  }

  // Set tenant context
  store.user.tenantId = targetTenantId;
  store.user.role = affiliation.role;
}

/**
 * Require user to access their own data or manage relatives
 */
export async function requireUserAccess(
  { request, store }: Context
) {
  if (!store.user) {
    return unauthorized();
  }

  // Check if user is accessing their own data
  const url = new URL(request.url);
  const requestedUserId = url.pathname.split('/').pop() || url.searchParams.get('userId');
  
  if (requestedUserId && requestedUserId !== store.user.id) {
    // Check if requested user is a relative the current user can manage
    const canManage = await canUserManageRelative(store.user.id, requestedUserId);
    
    if (!canManage) {
      return forbidden('Access denied');
    }
  }
}

/**
 * Check if user can manage a relative
 */
async function canUserManageRelative(userId: string, relativeId: string): Promise<boolean> {
  const { sql } = await import('../db/client');
  
  // Check if they're in the same family group and current user is primary contact
  const familyGroups = await sql`
    SELECT fg.id
    FROM "FamilyGroup" fg
    INNER JOIN "FamilyGroupMember" fgm1 ON fg.id = fgm1."familyGroupId"
    INNER JOIN "FamilyGroupMember" fgm2 ON fg.id = fgm2."familyGroupId"
    WHERE fg."primaryContactId" = ${userId}
      AND fgm1."userId" = ${userId}
      AND fgm2."userId" = ${relativeId}
    LIMIT 1
  `;

  return familyGroups.length > 0;
}
