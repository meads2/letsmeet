# PRD: LetsMeet Tech Stack

**Document type:** Product Requirements Document (Technical)  
**Product:** LetsMeet — swipe-based dating app  
**Last updated:** February 2025  
**Status:** Current as-built stack

---

## 1. Overview

This document describes the technology stack used by LetsMeet. It is the single source of truth for framework versions, third-party services, and architectural choices. Use it for onboarding, architecture decisions, and dependency audits.

---

## 2. Core Framework & Runtime

| Layer                | Technology       | Version           | Purpose                            |
| -------------------- | ---------------- | ----------------- | ---------------------------------- |
| **Runtime**          | Node.js          | 18+ (recommended) | JavaScript runtime                 |
| **Language**         | TypeScript       | ~5.9.2            | Type safety, tooling               |
| **UI Framework**     | React            | 19.1.0            | Component-based UI                 |
| **Mobile Framework** | React Native     | 0.81.5            | Cross-platform native UI           |
| **App Framework**    | Expo             | ~54.0.33          | Build, dev tooling, native modules |
| **DOM (Web)**        | react-dom        | 19.1.0            | Web target                         |
| **Web Adapter**      | react-native-web | ~0.21.0           | Run RN on web                      |

**Notes:**

- **New Architecture** is enabled in `app.json` (`newArchEnabled: true`).
- **Expo experiments:** typed routes, React Compiler.
- **Targets:** iOS, Android, Web (static output).

---

## 3. Routing & Navigation

| Technology                         | Version | Purpose                                          |
| ---------------------------------- | ------- | ------------------------------------------------ |
| **Expo Router**                    | ~6.0.23 | File-based routing, deep linking                 |
| **React Navigation**               | 7.x     | Underlying navigation (tabs, stack)              |
| **@react-navigation/bottom-tabs**  | ^7.4.0  | Tab bar (Explore, Matches, Marketplace, Profile) |
| **@react-navigation/native**       | ^7.1.8  | Core navigation                                  |
| **@react-navigation/elements**     | ^2.6.3  | Shared UI elements                               |
| **react-native-screens**           | ~4.16.0 | Native screen containers                         |
| **react-native-safe-area-context** | ~5.6.0  | Safe area handling                               |

**Conventions:**

- Routes live under `app/` (file-based).
- Auth-protected area: `app/(tabs)/`.
- Public: `app/index.tsx`, `app/sign-in.tsx`, `app/sign-up.tsx`, `app/onboarding/`.

---

## 4. Authentication

| Technology | Version                    | Purpose                                   |
| ---------- | -------------------------- | ----------------------------------------- |
| **Clerk**  | @clerk/clerk-expo ^2.19.23 | Sign-up, sign-in, sessions, user identity |

**Config:**

- Env: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Provider wraps app in `app/_layout.tsx`; auth guards and redirects are used for protected routes.
- Server-side session validation lives in `api/auth/` (Clerk + Neon).

---

## 5. Database & Backend Data

| Technology | Version                         | Purpose                      |
| ---------- | ------------------------------- | ---------------------------- |
| **Neon**   | @neondatabase/serverless ^1.0.2 | Serverless Postgres (hosted) |

**Usage:**

- Connection via `DATABASE_URL` (server/env only).
- Client and queries in `api/database/` (client, models, queries, migrations).
- Schema: `api/database/migrations/001_dating_schema.sql`.
- All DB access is server-side (API layer or backend); no direct DB from the app.

---

## 6. Data Fetching & Caching (Client)

| Technology         | Version                      | Purpose                                              |
| ------------------ | ---------------------------- | ---------------------------------------------------- |
| **TanStack Query** | @tanstack/react-query ^5.0.0 | Server state, caching, refetch, loading/error states |

**Pattern:**

- Single `QueryClientProvider` in root layout.
- Hooks in `hooks/` (e.g. `use-feed`, `use-matches`, `use-messages`, `use-swipe`, `use-subscription`) use React Query for API-backed data.

---

## 7. Payments & Subscriptions

| Technology | Version                            | Purpose                           |
| ---------- | ---------------------------------- | --------------------------------- |
| **Stripe** | @stripe/stripe-react-native 0.50.3 | In-app payments and subscriptions |

**Config:**

- Env: `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client); secret keys server-side only.
- Expo plugin: `@stripe/stripe-react-native` in `app.json`.
- Backend logic: `api/payments/` (Stripe client, subscription config, subscription helpers).

---

## 8. Feature Flags & Experimentation

| Technology  | Version                        | Purpose                            |
| ----------- | ------------------------------ | ---------------------------------- |
| **Statsig** | @statsig/expo-bindings ^3.31.2 | Feature flags, A/B tests, rollouts |

**Config:**

- Env: `EXPO_PUBLIC_STATSIG_CLIENT_KEY`.
- Provider in `app/_layout.tsx` (below Clerk so user context is available).
- Definitions and usage: `api/experiments/` (e.g. `features.ts`, `statsig.ts`).

---

## 9. Media & Images

| Technology            | Purpose                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Cloudinary**        | Upload, optimization, CDN (env: `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`, `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`) |
| **expo-image**        | ~3.0.11 — Image component with caching                                                                       |
| **expo-image-picker** | ~15.0.14 — Camera/gallery for profile photos                                                                 |

**Backend:**

- `api/utils/image-upload.ts` (Cloudinary integration).
- `api/utils/image-preloader.ts` for feed preloading.

---

## 10. Swipe & Animations

| Technology                       | Version | Purpose                             |
| -------------------------------- | ------- | ----------------------------------- |
| **react-native-deck-swiper**     | ^2.0.17 | Swipeable card stack (Explore feed) |
| **react-native-reanimated**      | ~4.1.1  | 60fps animations                    |
| **react-native-gesture-handler** | ~2.28.0 | Touch gestures                      |
| **react-native-worklets**        | 0.5.1   | Reanimated worklets                 |
| **expo-haptics**                 | ~15.0.8 | Haptic feedback on swipe/actions    |

**UI:**

- Swipe components in `components/swipe/`.
- Hooks: `hooks/use-swipe.ts`, `hooks/use-feed.ts`.

---

## 11. UI & System

| Technology               | Version  | Purpose              |
| ------------------------ | -------- | -------------------- |
| **expo-blur**            | ~14.0.4  | Blur effects         |
| **expo-linear-gradient** | ~14.0.5  | Gradients            |
| **expo-system-ui**       | ~6.0.9   | Status bar, UI theme |
| **expo-splash-screen**   | ~31.0.13 | Splash screen        |
| **expo-symbols**         | ~1.0.8   | SF Symbols (iOS)     |
| **@expo/vector-icons**   | ^15.0.3  | Icons                |
| **expo-constants**       | ~18.0.13 | App constants        |
| **expo-font**            | ~14.0.11 | Custom fonts         |
| **expo-status-bar**      | ~3.0.9   | Status bar control   |

---

## 12. Platform & Device

| Technology                                    | Version  | Purpose                            |
| --------------------------------------------- | -------- | ---------------------------------- |
| **expo-location**                             | ~18.0.7  | Location (e.g. distance in feed)   |
| **expo-secure-store**                         | ~14.0.11 | Secure key-value storage           |
| **@react-native-async-storage/async-storage** | ^2.1.0   | Persisted key-value storage        |
| **expo-web-browser**                          | ~15.0.10 | In-app browser (e.g. OAuth, links) |
| **expo-linking**                              | ~8.0.11  | Deep links, URLs                   |

---

## 13. Tooling & Quality

| Technology             | Version | Purpose                |
| ---------------------- | ------- | ---------------------- |
| **TypeScript**         | ~5.9.2  | Static typing          |
| **ESLint**             | ^9.25.0 | Linting                |
| **eslint-config-expo** | ~10.0.0 | Expo lint rules        |
| **@types/react**       | ~19.1.0 | React type definitions |

**Scripts (package.json):**

- `start` — Expo dev server
- `ios` / `android` / `web` — Platform-specific dev
- `lint` — `expo lint`

---

## 14. Project Layout (High Level)

```
letsmeet/
├── app/                    # Expo Router (screens & layouts)
├── api/                    # Backend logic (no separate server process)
│   ├── auth/               # Clerk + session
│   ├── database/           # Neon client, models, queries, migrations
│   ├── experiments/        # Statsig
│   ├── payments/           # Stripe
│   ├── utils/              # Image upload, validators, errors, formatters
│   └── types/              # Shared types
├── components/             # Reusable UI (swipe, modals, profile, chat, etc.)
├── hooks/                  # use-feed, use-swipe, use-matches, use-messages, use-subscription
├── assets/                 # Images, fonts
├── app.json                # Expo config (plugins, EAS, experiments)
├── tsconfig.json           # TypeScript (strict, path @/*)
├── package.json            # Dependencies (see above)
└── .env                    # EXPO_PUBLIC_* and DATABASE_URL (not committed)
```

---

## 15. Provider Order (Root Layout)

Order in `app/_layout.tsx`:

1. ErrorBoundary
2. ClerkProvider
3. ClerkLoaded
4. StatsigProvider
5. StripeProvider
6. QueryClientProvider
7. App (Expo Router)

---

## 16. Environment Variables Summary

| Variable                               | Required | Scope       | Purpose               |
| -------------------------------------- | -------- | ----------- | --------------------- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`    | Yes      | Client      | Clerk auth            |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`   | Yes      | Client      | Stripe payments       |
| `EXPO_PUBLIC_STATSIG_CLIENT_KEY`       | Yes      | Client      | Statsig feature flags |
| `DATABASE_URL`                         | Yes      | Server only | Neon Postgres         |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`    | Yes      | Client      | Cloudinary            |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Yes      | Client      | Cloudinary uploads    |

Stripe secrets and any server-only keys must never be exposed to the client.

---

## 17. Version Policy

- **Expo SDK:** Pinned to 54; align native packages with `expo install` where possible.
- **React / React Native:** Follow Expo compatibility matrix.
- **Third-party (Clerk, Stripe, Statsig, Neon, TanStack):** Use semver ranges (^) and upgrade with tests.

---

## 18. References

- [Expo Docs](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Clerk Expo](https://clerk.com/docs/quickstarts/expo)
- [Stripe React Native](https://docs.stripe.com/payments/accept-a-payment?platform=react-native)
- [Statsig Expo](https://docs.statsig.com/client/reactNativeExpoSDK)
- [Neon](https://neon.tech/docs/introduction)
- [TanStack Query](https://tanstack.com/query/latest)

---

_This PRD reflects the current LetsMeet codebase and should be updated when the tech stack or major versions change._
