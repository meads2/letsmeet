# Packages → apps/api Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move `packages/database` and `packages/shared` into `apps/api/` so all backend code lives under the `apps/` tree, and fix the root cause of the API breaking (packages compiled to `dist/` but Bun should resolve TypeScript source directly).

**Architecture:** Both packages are moved as sub-directories of `apps/api/` and kept as named workspace packages (`@letsmeet/database`, `@letsmeet/shared`). Their `main` entry is changed from `./dist/index.js` to `./src/index.ts` so Bun resolves TypeScript source directly — no build step required. Zero import changes are needed anywhere (package names stay the same, Bun workspace symlinks handle resolution).

**Tech Stack:** Bun workspaces, TypeScript, Drizzle ORM, Neon Serverless

---

## Key facts before starting

- `@letsmeet/shared` is used by **both** `apps/api` and `apps/mobile` — it stays a workspace package (not inlined), just moves location
- `@letsmeet/database` is used only by `apps/api` — same treatment for consistency
- After move, the root workspace list must be **explicit** (not a glob) because `apps/*` only matches one level deep
- `packages/database/drizzle.config.ts` has a hardcoded path `../../apps/api/.env` that must be updated to `../.env`
- `tsconfig.json` in each package extends `../../tsconfig.base.json` — must become `../../../tsconfig.base.json`

---

### Task 1: Move the packages into apps/api/

**Files:**
- Move: `packages/database/` → `apps/api/database/`
- Move: `packages/shared/` → `apps/api/shared/`

**Step 1: Move both directories**

```bash
mv packages/database apps/api/database
mv packages/shared apps/api/shared
rmdir packages
```

Expected: `packages/` directory is gone, `apps/api/database/` and `apps/api/shared/` exist.

**Step 2: Verify**

```bash
ls apps/api/database && ls apps/api/shared
```

Expected: see `src/`, `package.json`, `tsconfig.json`, etc. in both.

---

### Task 2: Fix tsconfig extends paths

The `extends` path `../../tsconfig.base.json` was relative to `packages/database/`. Now that the packages live at `apps/api/database/`, the root is three levels up.

**Files:**
- Modify: `apps/api/database/tsconfig.json`
- Modify: `apps/api/shared/tsconfig.json`

**Step 1: Fix database tsconfig**

Replace the `extends` line in `apps/api/database/tsconfig.json`:

```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

**Step 2: Fix shared tsconfig**

Replace the `extends` line in `apps/api/shared/tsconfig.json`:

```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

---

### Task 3: Switch packages to Bun-native TypeScript resolution

Both packages currently point `main` at the compiled `./dist/index.js`. In a Bun project this creates a fragile dependency on the build step. Switching to `./src/index.ts` lets Bun resolve TypeScript source directly — no `tsc` required before running the API.

**Files:**
- Modify: `apps/api/database/package.json`
- Modify: `apps/api/shared/package.json`

**Step 1: Update database package.json**

Change `main` and remove `types` (Bun infers types from `.ts` directly):

```json
{
  "name": "@letsmeet/database",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "seed": "bun run scripts/seed.ts",
    "cleanup": "bun run scripts/cleanup.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/migrate.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@letsmeet/shared": "*",
    "@neondatabase/serverless": "^1.0.2",
    "drizzle-orm": "^0.45.1"
  },
  "devDependencies": {
    "@clerk/backend": "^1.0.0",
    "@faker-js/faker": "^8.4.1",
    "dotenv": "^16.4.0",
    "drizzle-kit": "^0.31.9",
    "typescript": "~5.9.2"
  }
}
```

**Step 2: Update shared package.json**

```json
{
  "name": "@letsmeet/shared",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "typescript": "~5.9.2"
  }
}
```

---

### Task 4: Fix the drizzle.config.ts path

The config hard-codes the path to the API `.env` file. After moving from `packages/database/` to `apps/api/database/`, the relative path changes.

**Files:**
- Modify: `apps/api/database/drizzle.config.ts` line 12

**Step 1: Update the dotenv path**

Change:
```ts
dotenv.config({ path: resolve(__dirname, '../../apps/api/.env') });
```
To:
```ts
dotenv.config({ path: resolve(__dirname, '../.env') });
```

Explanation: `apps/api/database/__dirname` → `../` → `apps/api/` → `.env` ✓

---

### Task 5: Update root workspace config

The root `package.json` uses `workspaces: ["apps/*", "packages/*"]`. Since `apps/*` only matches one level deep, sub-directories of `apps/api/` won't be auto-discovered. Switch to an explicit list.

**Files:**
- Modify: `package.json` (root)

**Step 1: Replace workspace globs with explicit paths**

Change:
```json
"workspaces": [
  "apps/*",
  "packages/*"
]
```

To:
```json
"workspaces": [
  "apps/api",
  "apps/mobile",
  "apps/api/database",
  "apps/api/shared"
]
```

---

### Task 6: Reinstall and verify

**Step 1: Reinstall to rebuild workspace symlinks**

```bash
bun install
```

Expected: No errors. `bun install` resolves `@letsmeet/database` → `apps/api/database/` and `@letsmeet/shared` → `apps/api/shared/`.

**Step 2: Verify symlinks**

```bash
ls -la node_modules/@letsmeet/
```

Expected: `database -> ../../apps/api/database` and `shared -> ../../apps/api/shared`

**Step 3: Start the API and confirm it boots cleanly**

```bash
bun --cwd apps/api --watch src/index.ts &
sleep 6
kill %1
```

Expected output includes:
```
🚀 Server ready at http://0.0.0.0:3000
```

No `FST_ERR_PLUGIN_VERSION_MISMATCH` or `Cannot find module '@letsmeet/database'` errors.

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move packages into apps/api as workspace sub-packages

- packages/database -> apps/api/database
- packages/shared -> apps/api/shared
- Switch main entry to ./src/index.ts for Bun-native TS resolution
- Update workspace paths to explicit list
- Fix drizzle.config.ts .env path reference"
```
