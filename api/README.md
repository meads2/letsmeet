# API Directory

This directory contains all backend logic for the LetsMeet application.

## Structure

```
api/
├── auth/                   # Authentication & session management (Clerk)
│   ├── clerk.ts           # Clerk integration utilities
│   └── session.ts         # Session management
│
├── payments/              # Payment processing (Stripe)
│   ├── stripe.ts          # Stripe integration
│   └── subscriptions.ts   # Subscription management
│
├── database/              # Database operations (Neon Postgres)
│   ├── client.ts          # Database client configuration
│   ├── queries/           # Query functions organized by entity
│   │   ├── users.ts       # User queries
│   │   └── meetings.ts    # Meeting queries
│   └── models/            # Type definitions for database entities
│       ├── user.ts        # User model
│       └── meeting.ts     # Meeting model
│
├── experiments/           # Feature flags & A/B testing (Statsig)
│   ├── statsig.ts         # Statsig integration
│   └── features.ts        # Feature flag definitions
│
├── utils/                 # Shared utilities
│   ├── validators.ts      # Input validation functions
│   ├── formatters.ts      # Data formatting utilities
│   └── errors.ts          # Error handling & custom errors
│
└── types/                 # Shared TypeScript types
    └── index.ts           # Common type definitions

```

## Module Overview

### Authentication (`/auth`)
Handles all authentication logic using Clerk:
- User authentication state
- Session management
- User metadata retrieval
- Token validation

### Payments (`/payments`)
Manages payment processing with Stripe:
- Payment intent creation
- Payment sheet handling
- Subscription management
- Payment method storage

### Database (`/database`)
Database operations with Neon Postgres:
- Database client configuration
- Query functions for each entity
- Type-safe model definitions
- CRUD operations

### Experiments (`/experiments`)
Feature management with Statsig:
- Feature gate checks
- A/B test experiments
- Dynamic configuration
- Centralized feature flag definitions

### Utils (`/utils`)
Shared utility functions:
- Input validation
- Data formatting
- Error handling
- Common helpers

### Types (`/types`)
Shared TypeScript type definitions:
- API response structures
- Pagination types
- Common interfaces

## Usage Examples

### Authentication
```typescript
import { useAuthState, getUserMetadata } from '@/api/auth';

const { isAuthenticated, user } = useAuthState();
const metadata = getUserMetadata(user);
```

### Payments
```typescript
import { processPayment } from '@/api/payments';

await processPayment(2999, 'usd'); // $29.99
```

### Database
```typescript
import { getUserById, createMeeting } from '@/api/database';

const user = await getUserById('123');
const meeting = await createMeeting({
  title: 'Team Standup',
  organizerId: user.id,
  startTime: new Date(),
  endTime: new Date(),
});
```

### Feature Flags
```typescript
import { useFeatureGate, FeatureGates } from '@/api/experiments';

const hasAccess = useFeatureGate(FeatureGates.PREMIUM_SCHEDULING);
```

## Best Practices

1. **Keep concerns separated** - Each module should have a single responsibility
2. **Use TypeScript types** - All functions should be properly typed
3. **Error handling** - Use custom error classes from `utils/errors.ts`
4. **Validation** - Validate inputs using `utils/validators.ts`
5. **Async/await** - Use async/await for all asynchronous operations
6. **Export patterns** - Export through index files for clean imports

## Adding New Modules

When adding new functionality:

1. Create a new directory under `/api` if it's a major feature
2. Add an `index.ts` file to export public functions
3. Define types in `/types` if they're shared across modules
4. Document the module in this README
5. Add example usage

## Environment Variables

Make sure these are set in your `.env` file:
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe payments
- `EXPO_PUBLIC_STATSIG_CLIENT_KEY` - Statsig experiments
- `DATABASE_URL` - Neon Postgres connection string
