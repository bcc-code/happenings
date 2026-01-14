# API Tests

This directory contains test utilities and setup files for API and business logic testing.

## Structure

```
tests/
├── setup.ts          # Global test setup (runs before all tests)
└── utils/
    └── test-helpers.ts  # Reusable test utilities
```

## Usage

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage
```

### Writing Tests

Place test files next to the source files they test:

```
src/
└── utils/
    ├── response.ts
    └── __tests__/
        └── response.test.ts
```

### Test Helpers

Import test helpers from `tests/utils/test-helpers.ts`:

```typescript
import { createMockAuthContext, assertJsonResponse } from '../../tests/utils/test-helpers';
```

## Best Practices

1. Test pure functions thoroughly
2. Mock external dependencies (database, APIs, Auth0)
3. Test error cases and edge conditions
4. Keep tests fast and isolated
5. Use descriptive test names
