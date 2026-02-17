# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LetsMeet is a dating/social app built as a monorepo using Bun for package management. It consists of:
- **Mobile App**: React Native app using Expo (SDK 54) with Expo Router for file-based routing
- **API Server**: Fastify-based REST API running on Bun
- **Shared Packages**: Database access layer and shared types/validators

## Technology Stack

- **Package Manager**: Bun (not npm/yarn)
- **Mobile**: Expo ~54.0.33, React Native 0.81.5, React 19.1.0
  - **React Compiler**: Enabled (`reactCompiler: true`)
  - **New Architecture**: Enabled (`newArchEnabled: true`)
- **Backend**: Fastify 4.x on Bun runtime
- **Database**: Neon Postgres (serverless)
- **Authentication**: Clerk (client + server SDKs)
- **Payments**: Stripe
- **Feature Flags**: Statsig
- **Validation**: Zod schemas
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios with interceptors

## Monorepo Structure

```
apps/
  mobile/          - Expo React Native app
    app/           - Expo Router file-based routes
    components/    - React components organized by feature
    hooks/         - Custom React hooks
    lib/           - Utilities and configuration
  api/             - Fastify API server
    src/
      routes/      - API route handlers (profiles, swipes, matches, messages, feed, payments, webhooks)
      plugins/     - Fastify plugins (auth, error-handler)
      config/      - Configuration (env, cors)

packages/
  database/        - Database client and queries for Neon Postgres
    src/
      queries/     - Query functions (users, profiles, swipes, matches, messages, feed)
      client.ts    - Neon client setup
  shared/          - Shared types, validators, constants
    src/
      types/       - TypeScript types (profile, match, message, swipe, api)
      validators/  - Zod schemas
      constants/   - App constants
```

## Common Development Commands

### Running the Application

**Both API and Mobile concurrently:**
```bash
bun dev
```

**API only:**
```bash
bun dev:api
# or from apps/api directory:
cd apps/api && bun --watch src/index.ts
```

**Mobile only:**
```bash
bun dev:mobile
# or from apps/mobile directory:
cd apps/mobile && expo start
```

**Mobile with specific platform:**
```bash
bun dev:ios        # API + iOS simulator
bun dev:android    # API + Android emulator
bun ios            # iOS only
bun android        # Android only
```

### Building

**Build all workspaces:**
```bash
bun build
```

**Build specific workspaces:**
```bash
bun build:api      # Bun build for API
bun build:mobile   # Expo export for mobile
```

**Build shared packages:**
```bash
cd packages/database && bun build  # TypeScript compilation
cd packages/shared && bun build    # TypeScript compilation
```

### Linting

```bash
bun lint           # Lint all workspaces
```

### Database

**Seed database:**
```bash
cd packages/database && bun run seed
```

**Cleanup database:**
```bash
cd packages/database && bun run cleanup
```

## Architecture Patterns

### API Route Structure

Routes are registered in `apps/api/src/routes/index.ts` with prefix `/api/v1`. Each route module uses Fastify's plugin pattern:

```typescript
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    // Handler
  });
};

export default routes;
```

**Available Routes:**
- `GET /api/v1/profiles/me` - Get current user's profile
- `POST /api/v1/profiles` - Create profile
- `PATCH /api/v1/profiles/me` - Update profile
- `DELETE /api/v1/profiles/me` - Delete profile
- `POST /api/v1/swipes` - Create a swipe (like/pass)
- `GET /api/v1/swipes/count` - Get swipe count for today
- `GET /api/v1/matches` - Get all matches
- `DELETE /api/v1/matches/:matchId` - Delete a match
- `GET /api/v1/messages/:matchId` - Get messages for a match
- `POST /api/v1/messages` - Send a message
- `PATCH /api/v1/messages/:matchId/read` - Mark messages as read
- `GET /api/v1/feed` - Get profiles to swipe on
- `GET /api/v1/feed/count` - Get feed count
- `POST /api/v1/payments/create-checkout` - Create Stripe checkout session
- `GET /api/v1/payments/subscription` - Get subscription status
- `POST /webhooks/clerk` - Clerk webhook handler
- `POST /webhooks/stripe` - Stripe webhook handler

### Authentication

- **Mobile**: Uses `@clerk/clerk-expo` with `<ClerkProvider>` wrapping the app
  - `useApiClient()` hook sets up axios with Clerk token interceptor
  - Tokens automatically injected via `Authorization: Bearer <token>` header
- **API**: Uses custom auth plugin (`apps/api/src/plugins/auth.ts`) that verifies Clerk session tokens
  - Validates token with Clerk Backend SDK
  - Decorates request with `userId` and `clerkId` after verification
- **Protected Routes**: Most API routes require authentication; webhooks are public but verify signatures

### Database Access

The database package exports query functions that use raw SQL with the Neon serverless client:

```typescript
import { query, queryOne } from '@letsmeet/database';

// Multi-row query
const users = await query<User>('SELECT * FROM users WHERE ...');

// Single-row query
const user = await queryOne<User>('SELECT * FROM users WHERE id = $1', [id]);
```

**Note**: Neon Serverless doesn't support traditional transactions. The `transaction` function exists but uses a callback pattern.

### Shared Types and Validation

- **Types**: TypeScript interfaces defined in `packages/shared/src/types/`
- **Validators**: Zod schemas in `packages/shared/src/validators/`
- **Import**: `import { Profile, validateProfile } from '@letsmeet/shared'`

### Mobile Navigation

Uses Expo Router with file-based routing:
- `app/(tabs)/` - Tab-based navigation (explore, matches, marketplace, profile)
  - `explore.tsx` - Main swipe screen
  - `matches/` - Match list and chat screens
  - `marketplace.tsx` - Subscription/payments
  - `profile.tsx` - User profile
- `app/onboarding/` - Onboarding flow (basic-info, photos, preferences)
- `app/sign-in.tsx` / `app/sign-up.tsx` - Authentication screens
- `app/index.tsx` - Landing/redirect screen

### Mobile Component Organization

Components are organized by feature:
- `components/auth/` - Authentication UI components
- `components/chat/` - Chat/messaging components
- `components/common/` - Reusable UI components (buttons, inputs, etc.)
- `components/swipe/` - Swipe card components (uses react-native-deck-swiper)
- `components/profile/` - Profile display/edit components
- `components/subscription/` - Payment/subscription UI
- `components/modals/` - Modal dialogs

### Data Fetching Pattern

Mobile app uses custom hooks that wrap TanStack Query:
- `hooks/use-feed.ts` - Get profiles to swipe on
- `hooks/use-swipe.ts` - Create swipes
- `hooks/use-matches.ts` - Get matches
- `hooks/use-messages.ts` - Send/receive messages
- `hooks/use-subscription.ts` - Stripe checkout and subscription status

All hooks use the API client from `lib/api-client.ts` which:
1. Uses axios with base URL from `expo-constants`
2. Automatically injects Clerk auth token via interceptor
3. Unwraps API response data (returns `response.data.data`)
4. Handles errors and 401 responses

## Environment Setup

### API Environment Variables (.env)

Required:
- `DATABASE_URL` - Neon Postgres connection string
- `CLERK_SECRET_KEY` - Clerk backend API key
- `STRIPE_SECRET_KEY` - Stripe secret key

Optional:
- `NODE_ENV` - development/production/test (default: development)
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `CLERK_WEBHOOK_SECRET` - For Clerk webhook verification
- `STRIPE_WEBHOOK_SECRET` - For Stripe webhook verification
- `ALLOWED_ORIGINS` - Comma-separated CORS origins

All environment variables are validated using Zod in `apps/api/src/config/env.ts`.

### Mobile Environment Variables (.env)

All client-side variables must be prefixed with `EXPO_PUBLIC_`:
- `EXPO_PUBLIC_API_URL` - API base URL (e.g., http://localhost:3000/api/v1)
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk frontend key
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `EXPO_PUBLIC_STATSIG_CLIENT_KEY` - Statsig client key

## Key Features

### Core Functionality
- **Swipe-based matching** (Tinder-style using react-native-deck-swiper)
- **Real-time messaging** between matches
- **User profiles** with photos and preferences
- **Discovery feed** with filtering
- **Subscription payments** via Stripe

### Third-Party Integrations
- **Clerk**: User authentication and session management
- **Stripe**: Subscription and payment processing
- **Statsig**: Feature flags and A/B testing
- **Neon**: Serverless Postgres database

## API Response Format

All API responses follow this structure:
```typescript
{
  success: boolean;
  data?: T;  // Present on success
  error?: {  // Present on error
    message: string;
    code: string;
  }
}
```

The mobile API client automatically unwraps the `data` field, so hooks receive the data directly.

## Webhook Handling

### Clerk Webhooks (`apps/api/src/routes/webhooks.ts`)
- Handles user lifecycle events (user.created, user.updated, user.deleted)
- Creates corresponding database records
- Verifies webhook signature with Svix

### Stripe Webhooks (`apps/api/src/routes/webhooks.ts`)
- Handles subscription events (checkout.session.completed, customer.subscription.*)
- Updates user subscription status in database
- Verifies webhook signature with Stripe SDK

## Development Notes

- **Use Bun commands**, not npm/yarn (e.g., `bun install`, `bun add`, `bun run`)
- **API runs on Bun runtime**: Uses `bun --watch` for hot reload, not `nodemon`
- **Mobile uses Expo Go**: Run on physical device or simulator via QR code
- **Database queries use raw SQL**: No ORM, direct parameterized queries via Neon client
- **Type safety**: Shared types ensure consistency between frontend/backend
- **Fastify plugins**: Auth and error handling registered globally via `server.register()`
- **Rate limiting**: 100 requests per minute (disabled for localhost in dev)
- **React 19**: Mobile app uses React 19 - be aware of breaking changes from React 18
- **React Compiler**: Enabled in Expo config for automatic optimizations
- **Typed Routes**: Expo Router typed routes enabled for type-safe navigation
