# Component Tests

This directory contains test setup and utilities for Vue component testing.

## Structure

```
tests/
├── setup.ts          # Vitest setup (runs before all tests)
└── utils/
    └── test-utils.ts  # Component testing utilities
```

## Usage

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

Place test files in `__tests__` directories next to components:

```
components/
└── displays/
    ├── Text.vue
    └── __tests__/
        └── Text.test.ts
```

### Test Utilities

Import test utilities from `tests/utils/test-utils.ts`:

```typescript
import { createComponentWrapper, mockFetch } from '../../tests/utils/test-utils';
```

## Best Practices

1. Test user-visible behavior, not implementation
2. Use Testing Library queries when possible
3. Simulate real user interactions
4. Test edge cases (null, empty, error states)
5. Keep tests isolated and independent
