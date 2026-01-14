/**
 * Test utilities for component testing
 * Provides common helpers and mocks for Vue component tests
 * 
 * Note: With @nuxt/test-utils 4, Nuxt components are automatically
 * set up with the Nuxt environment. This utility provides additional helpers.
 */

import { mount, VueWrapper } from '@vue/test-utils';
import { ComponentPublicInstance } from 'vue';
import { vi } from 'vitest';
import PrimeVue from 'primevue/config';

/**
 * Custom mount function with common setup
 * Includes PrimeVue and other global configurations
 * 
 * For Nuxt 4 with @nuxt/test-utils, you can also use renderComponent
 * from @nuxt/test-utils for better Nuxt integration
 */
export function createComponentWrapper<T = ComponentPublicInstance>(
  component: any,
  options: any = {}
): VueWrapper<T> {
  const {
    global = {},
    props = {},
    slots = {},
    ...restOptions
  } = options;

  return mount(component, {
    global: {
      plugins: [
        PrimeVue,
      ],
      ...global,
    },
    props,
    slots,
    ...restOptions,
  });
}

/**
 * Wait for next tick
 */
export async function waitForNextTick() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Wait for a specific condition
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Mock API response helper
 */
export function createMockApiResponse<T>(data: T, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response;
}

/**
 * Mock fetch helper
 */
export function mockFetch(response: any, status = 200) {
  global.fetch = vi.fn(() =>
    Promise.resolve(createMockApiResponse(response, status))
  ) as any;
}
