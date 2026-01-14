/**
 * Example test for response utility functions
 * Demonstrates best practices for testing business logic
 * 
 * To run: bun test src/utils/__tests__/response.test.ts
 */

import { describe, it, expect, beforeAll } from 'bun:test';
import { error, unauthorized, forbidden } from '../response';

// Import test setup if needed
// This ensures test environment is configured
beforeAll(() => {
  // Test setup can be done here or in individual test files
  process.env.NODE_ENV = 'test';
});

describe('Response Utilities', () => {
  describe('error', () => {
    it('creates error response with default status 400', async () => {
      const response = error('Something went wrong', 'ERROR_CODE');
      
      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      
      const data = await response.json();
      expect(data).toEqual({
        error: 'Something went wrong',
        code: 'ERROR_CODE',
      });
    });

    it('creates error response with custom status', async () => {
      const response = error('Not found', 'NOT_FOUND', 404);
      
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({
        error: 'Not found',
        code: 'NOT_FOUND',
      });
    });

    it('includes details when provided', async () => {
      const details = { field: 'email', reason: 'invalid format' };
      const response = error('Validation failed', 'VALIDATION_ERROR', 400, details);
      
      const data = await response.json();
      expect(data).toEqual({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details,
      });
    });
  });

  describe('unauthorized', () => {
    it('creates 401 unauthorized response with default message', async () => {
      const response = unauthorized();
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
    });

    it('creates 401 unauthorized response with custom message', async () => {
      const response = unauthorized('Token expired');
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({
        error: 'Token expired',
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('forbidden', () => {
    it('creates 403 forbidden response with default message', async () => {
      const response = forbidden();
      
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data).toEqual({
        error: 'Access denied',
        code: 'FORBIDDEN',
      });
    });

    it('creates 403 forbidden response with custom message', async () => {
      const response = forbidden('Insufficient permissions');
      
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data).toEqual({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
      });
    });
  });
});
