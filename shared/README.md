# @bcc-events/shared

Shared types, utilities, and composables for the BCC Events Registration App.

## Usage

### In API

```typescript
import { User, Event, formatCurrency } from '@bcc-events/shared';

// Use types
const user: User = { ... };

// Use utilities
const formatted = formatCurrency(100, 'USD');
```

### In Frontend (Admin Dashboard / End User App)

```typescript
import { User, Event, formatCurrency, useApi } from '@bcc-events/shared';

// Use types
const user: User = { ... };

// Use utilities
const formatted = formatCurrency(100, 'USD');

// Use composables (Vue 3)
const { data, loading, error } = useApi('/api/events');
```

## Structure

```
shared/
├── src/
│   ├── types/        # TypeScript types and interfaces
│   ├── utils/        # Utility functions
│   ├── composables/  # Vue 3 composables (frontend only)
│   └── index.ts      # Main entry point
├── package.json
└── tsconfig.json
```

## Building

```bash
pnpm build
```

## Development

```bash
pnpm dev  # Watch mode
```
