/**
 * Simple authentication routes for super admin
 * Uses environment variables for credentials (development only)
 */

import { Elysia } from 'elysia';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { error, success } from '../../utils/response';

const router = new Elysia();

/**
 * Login endpoint for super admin
 */
router.post('/login', async ({ body }) => {
  try {
    const { username, password } = body as { username?: string; password?: string };

    if (!username || !password) {
      return error('Username and password are required', 'VALIDATION_ERROR', 400);
    }

    // Get credentials from environment
    const superAdminUsername = process.env.SUPER_ADMIN_USERNAME || 'admin';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin';

    // Verify credentials
    if (username !== superAdminUsername || password !== superAdminPassword) {
      return error('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: 'super_admin',
        role: 'super_admin',
        type: 'super_admin',
      },
      process.env.JWT_SECRET || 'super-admin-secret-change-in-production',
      {
        expiresIn: '24h',
      }
    );

    return success({
      token,
      user: {
        username: superAdminUsername,
        role: 'super_admin',
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
});

/**
 * Verify token endpoint
 */
router.get('/verify', async ({ request }) => {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error('No token provided', 'UNAUTHORIZED', 401);
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super-admin-secret-change-in-production'
      ) as any;

      if (decoded.role !== 'super_admin' || decoded.type !== 'super_admin') {
        return error('Invalid token', 'UNAUTHORIZED', 401);
      }

      return success({
        valid: true,
        user: {
          username: decoded.sub,
          role: decoded.role,
        },
      });
    } catch (jwtError) {
      return error('Invalid or expired token', 'UNAUTHORIZED', 401);
    }
  } catch (err: any) {
    console.error('Verify error:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
});

export default router;
