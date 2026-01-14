/**
 * Test helpers for API and business logic testing
 * Provides common utilities for testing backend code
 */

import { Elysia } from 'elysia';

/**
 * Create a test Elysia app instance
 */
export function createTestApp() {
  return new Elysia();
}

/**
 * Mock JWT token for testing
 */
export function createMockJWT(payload: Record<string, any> = {}) {
  // In a real scenario, you'd use a test key to sign tokens
  // For now, return a mock token structure
  return `mock.jwt.token.${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
}

/**
 * Create mock authenticated context
 */
export function createMockAuthContext(overrides: any = {}) {
  return {
    store: {
      user: {
        id: 'test-user-id',
        auth0Id: 'auth0|test-user',
        email: 'test@example.com',
        tenantId: 'test-tenant-id',
        role: 'admin',
        affiliations: [],
        ...overrides.user,
      },
    },
    request: {
      headers: new Headers({
        'Authorization': `Bearer ${createMockJWT()}`,
        'X-Tenant-ID': 'test-tenant-id',
      }),
    },
    ...overrides,
  };
}

/**
 * Wait for async operations
 */
export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Assert response is JSON and matches structure
 */
export async function assertJsonResponse(response: Response, expectedStatus = 200) {
  expect(response.status).toBe(expectedStatus);
  expect(response.headers.get('Content-Type')).toContain('application/json');
  return await response.json();
}

/**
 * Assert error response structure
 */
export async function assertErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedCode?: string
) {
  expect(response.status).toBe(expectedStatus);
  const data = await assertJsonResponse(response, expectedStatus);
  expect(data).toHaveProperty('error');
  if (expectedCode) {
    expect(data).toHaveProperty('code', expectedCode);
  }
  return data;
}
