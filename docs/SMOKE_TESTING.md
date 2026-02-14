# Smoke testing guide

## Recommended local flow
1. Install dependencies.
2. Install Playwright browser runtime.
3. Run the smoke test.

```bash
npm run test:smoke:install
npm run test:smoke
```

## Why this script uses `npx playwright test`
Using `npx` makes smoke tests more resilient when `node_modules/.bin/playwright` is missing.
If `@playwright/test` is already installed, `npx` will use the local package.

## Expected app boot path
- The smoke test starts Vite on `http://127.0.0.1:4173` using `playwright.config.ts`.
- It waits for `window.__RPG_SMOKE_TEST__` and verifies player movement after `W` input.

## Environment caveat (Codex container)
If your environment blocks npm registry access, Playwright package installation can fail with HTTP 403.
In that case, the app can still be sanity-checked using the browser container tool until package access is available.
