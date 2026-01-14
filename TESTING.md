# Testing Guide

This document outlines the testing strategy and best practices for the BCC Events Registration application.

## Overview

We maintain a strict unit test culture with two separate testing pipelines:

1. **Component Testing** - Frontend Vue 3 components (admin-dashboard, end-user-app)
2. **API & Business Logic Testing** - Backend API routes, utilities, and business logic

## Component Testing

### Technology Stack

- **Framework**: Vitest
- **Component Testing**: Vue Test Utils + Testing Library
- **Environment**: happy-dom (lightweight DOM implementation)
- **Coverage**: v8 coverage provider

### Setup

Component tests are located in `__tests__` directories next to the components they test, or in a `tests/` directory at the package root.

### Running Tests

```bash
# Run all component tests
pnpm --filter "./admin-dashboard" test
pnpm --filter "./end-user-app" test

# Run tests in watch mode
pnpm --filter "./admin-dashboard" test:watch

# Run tests with coverage
pnpm --filter "./admin-dashboard" test:coverage

# Run tests with UI
pnpm --filter "./admin-dashboard" test:ui
```

### Test File Naming

- `*.test.ts` or `*.spec.ts` for test files
- Place test files in `__tests__` directories next to components
- Example: `components/displays/__tests__/Text.test.ts`

### Component Test Best Practices

1. **Test Behavior, Not Implementation**
   ```typescript
   // ✅ Good - Tests what the user sees
   expect(wrapper.text()).toBe('Hello World');
   
   // ❌ Bad - Tests implementation details
   expect(wrapper.vm.displayValue).toBe('Hello World');
   ```

2. **Use Testing Library Queries**
   ```typescript
   // ✅ Good - User-centric queries
   const button = screen.getByRole('button', { name: 'Submit' });
   
   // ❌ Bad - Implementation details
   const button = wrapper.find('.submit-button');
   ```

3. **Test User Interactions**
   ```typescript
   // ✅ Good - Simulates user behavior
   await userEvent.click(button);
   expect(onSubmit).toHaveBeenCalled();
   ```

4. **Keep Tests Isolated**
   - Each test should be independent
   - Use `beforeEach` and `afterEach` for setup/cleanup
   - Mock external dependencies

5. **Test Edge Cases**
   - Null/undefined values
   - Empty states
   - Error states
   - Loading states

### Example Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Text from '../Text.vue';

describe('Text Display Component', () => {
  it('renders text value correctly', () => {
    const wrapper = mount(Text, {
      props: { value: 'Hello World' },
    });
    expect(wrapper.text()).toBe('Hello World');
  });
});
```

## API & Business Logic Testing

### Technology Stack

- **Framework**: Bun's built-in test runner
- **Test Files**: `*.test.ts` or `*.spec.ts`
- **Location**: `__tests__` directories next to source files

### Setup

API tests use Bun's native test runner, which is fast and doesn't require additional dependencies.

### Running Tests

```bash
# Run all API tests
pnpm --filter "./api" test

# Run tests in watch mode
pnpm --filter "./api" test:watch

# Run tests with coverage
pnpm --filter "./api" test:coverage
```

### Test File Naming

- `*.test.ts` or `*.spec.ts` for test files
- Place test files in `__tests__` directories next to source files
- Example: `src/utils/__tests__/response.test.ts`

### API Test Best Practices

1. **Test Pure Functions First**
   - Utilities and helpers should be thoroughly tested
   - These are the foundation of your application

2. **Mock External Dependencies**
   - Database calls
   - External APIs
   - File system operations
   - Authentication providers

3. **Test Error Cases**
   ```typescript
   it('returns 401 when token is missing', async () => {
     const response = await app.handle(
       new Request('http://localhost/api/admin/events')
     );
     expect(response.status).toBe(401);
   });
   ```

4. **Use Test Helpers**
   - Create reusable test utilities
   - Mock data factories
   - Common assertions

5. **Test Response Structure**
   ```typescript
   const data = await response.json();
   expect(data).toHaveProperty('error');
   expect(data).toHaveProperty('code');
   ```

### Example API Test

```typescript
import { describe, it, expect } from 'bun:test';
import { error } from '../response';

describe('Response Utilities', () => {
  it('creates error response with default status 400', async () => {
    const response = error('Something went wrong', 'ERROR_CODE');
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({
      error: 'Something went wrong',
      code: 'ERROR_CODE',
    });
  });
});
```

## Coverage Requirements

### Minimum Coverage Thresholds

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

These thresholds are enforced in CI/CD pipelines. Coverage reports are generated and can be viewed locally or in CI.

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

### Workflows

1. **test-components.yml** - Runs component tests for admin-dashboard and end-user-app
2. **test-api.yml** - Runs API tests with PostgreSQL service
3. **test-all.yml** - Orchestrates all test workflows

### Coverage Reports

Coverage reports are uploaded to Codecov (if configured) and can be viewed in:
- GitHub Actions artifacts
- Local `coverage/` directories after running `test:coverage`

## Test Organization

### Directory Structure

```
admin-dashboard/
├── components/
│   └── displays/
│       ├── Text.vue
│       └── __tests__/
│           └── Text.test.ts
├── tests/
│   ├── setup.ts
│   └── utils/
│       └── test-utils.ts

api/
├── src/
│   └── utils/
│       ├── response.ts
│       └── __tests__/
│           └── response.test.ts
└── tests/
    ├── setup.ts
    └── utils/
        └── test-helpers.ts
```

## Common Testing Patterns

### Mocking Nuxt Composables

With @nuxt/test-utils 4 and Nuxt 4, Nuxt composables are automatically available in the test environment. You typically don't need to mock them unless you want to override default behavior:

```typescript
// With @nuxt/test-utils 4, composables are available automatically
// Only mock if you need custom behavior:
import { vi } from 'vitest';

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiUrl: 'http://localhost:9009',
    },
  }),
}));
```

### Mocking API Calls

```typescript
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ data: 'test' }),
  })
);
```

### Testing Async Operations

```typescript
it('handles async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

## Best Practices Summary

1. ✅ Write tests before or alongside code (TDD/BDD)
2. ✅ Keep tests simple and focused
3. ✅ Test behavior, not implementation
4. ✅ Use descriptive test names
5. ✅ Keep tests fast and independent
6. ✅ Mock external dependencies
7. ✅ Test edge cases and error conditions
8. ✅ Maintain high coverage (80%+)
9. ✅ Review test failures immediately
10. ✅ Refactor tests when refactoring code

## Troubleshooting

### Component Tests

- **Issue**: Tests fail with "Cannot find module"
  - **Solution**: With @nuxt/test-utils 4, the Nuxt environment is automatically configured. Check that you're using `defineVitestConfig` from `@nuxt/test-utils/config` in your vitest.config.ts

- **Issue**: Nuxt composables not available in tests
  - **Solution**: Ensure you're using `environment: 'nuxt'` in your vitest config and `defineVitestConfig` from `@nuxt/test-utils/config`

- **Issue**: PrimeVue components not rendering
  - **Solution**: Ensure PrimeVue plugin is registered in test setup or component mount options

### API Tests

- **Issue**: Database connection errors
  - **Solution**: Ensure TEST_DATABASE_URL is set correctly

- **Issue**: Auth0 token validation fails
  - **Solution**: Mock the JWT verification in tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/)
- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Elysia Testing](https://elysiajs.com/plugins/testing)
