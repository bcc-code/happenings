/**
 * Bun test setup file
 * This file runs before all tests
 */

import { beforeEach, afterEach } from 'bun:test';

// Global test setup
beforeEach(() => {
  // Reset mocks, clear database, etc.
  // This runs before each test
});

afterEach(() => {
  // Cleanup after each test
  // Close connections, clear state, etc.
});

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';
