/**
 * Vitest setup file for admin-dashboard
 * This file runs before all tests
 * 
 * Note: With @nuxt/test-utils 4 and Nuxt 4, the Nuxt environment
 * is automatically set up. This file is for additional mocks and setup.
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Note: With @nuxt/test-utils, Nuxt composables are automatically available
// Only mock if you need to override default behavior
// For Nuxt 4, composables are available via the test environment

// Mock PrimeVue components globally if needed
// This can be extended based on your testing needs

// Global test utilities
global.console = {
  ...console,
  // Uncomment to silence console logs during tests
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};
