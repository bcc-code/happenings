# Testing Quick Start

Quick reference for running and writing tests in this project.

## Running Tests

### All Tests
```bash
# Run all tests (components + API)
pnpm test

# Run only component tests
pnpm test:components

# Run only API tests
pnpm test:api
```

### Component Tests (Frontend)
```bash
# Admin Dashboard
cd admin-dashboard
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage

# End User App
cd end-user-app
pnpm test
pnpm test:watch
pnpm test:coverage
```

### API Tests (Backend)
```bash
cd api
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
```

## Writing Tests

### Component Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MyComponent from '../MyComponent.vue';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: { value: 'test' },
    });
    expect(wrapper.text()).toContain('test');
  });
});
```

### API Test Template

```typescript
import { describe, it, expect } from 'bun:test';
import { myFunction } from '../my-function';

describe('myFunction', () => {
  it('returns expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

## Test File Locations

- **Components**: `components/**/__tests__/*.test.ts`
- **API/Utils**: `src/**/__tests__/*.test.ts`

## Coverage Requirements

- Minimum: 80% for lines, functions, branches, statements
- Enforced in CI/CD
- View reports: `coverage/index.html` after running `test:coverage`

## Common Commands

```bash
# Watch mode (recommended during development)
pnpm --filter "./admin-dashboard" test:watch
pnpm --filter "./api" test:watch

# Coverage reports
pnpm --filter "./admin-dashboard" test:coverage
pnpm --filter "./api" test:coverage

# Run specific test file
bun test src/utils/__tests__/response.test.ts
```

## Need Help?

See [TESTING.md](./TESTING.md) for detailed documentation.
