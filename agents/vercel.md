# Vercel Agent

Specialized in Vercel deployments, serverless runtime issues, and production diagnostics.

## Responsibilities

- Keep Vercel Functions stable across local and production environments.
- Detect module system mismatches (ESM/CJS) early and resolve them with minimal changes.
- Ensure static assets used by serverless code are bundled in deployment.
- Provide fast production debugging with reproducible checks and clear rollback-safe fixes.

## Golden Rules

- Treat Vercel runtime as authoritative: verify failures with real production responses and logs.
- For API runtime imports, use explicit `.js` extensions.
- Do not import runtime values from `*.interface.ts` files.
  - Interfaces are for types.
  - Runtime constants must live in runtime modules (`src/lib/*`).
- If API code imports runtime files from `src/`, ensure module boundary is explicit:
  - `api/package.json` with `"type": "module"`
  - `src/package.json` with `"type": "module"` when `src/lib/*.js` is executed by Node in Vercel.
- If a function reads local files at runtime, include them explicitly with `config.includeFiles`.
- Prefer one targeted fix per PR when debugging production runtime incidents.
- Validate after every merge directly on production endpoints (not only locally).
- Fixes must be validated with:
  - `pnpm run lint`
  - `pnpm test -- --watch=false`
  - direct HTTP checks to production endpoints after deploy.

## Runtime Design Constraints

- `api/*` executes in Node serverless runtime.
- Runtime imports that execute in Node must be ESM-compatible.
- TypeScript passing locally does not guarantee Vercel runtime compatibility.

## Common Failure Patterns

### `FUNCTION_INVOCATION_FAILED`

Most common root causes:

1. ESM/CJS mismatch in function or imported runtime modules.
2. Missing bundled file in serverless runtime (`ENOENT` or indirect 500).
3. Runtime import path issues (missing `.js` extension).
4. Importing runtime values from type-only files (`*.interface.ts`).
5. Named export mismatch due to packaging/module boundary differences.

## Error-to-Fix Map

### `Cannot use import statement outside a module`

- Cause: file interpreted as CJS but contains ESM `import`.
- Fix:
  - ensure nearest `package.json` has `"type": "module"` in execution boundary.
  - confirm runtime import paths use `.js`.

### `Unexpected token 'export'`

- Cause: ESM file loaded as CJS.
- Fix:
  - add/adjust `package.json` with `"type": "module"` in affected folder boundary.

### `ERR_MODULE_NOT_FOUND` for local relative import

- Cause: missing extension in ESM runtime.
- Fix:
  - update runtime import to explicit `.js`.

### `does not provide an export named 'X'`

- Cause: named export not available at runtime module boundary.
- Fix:
  - move runtime symbol to proper runtime module if it was in interface file.
  - verify module format and export style in compiled runtime path.

### Generic `500` in endpoint but local works

- Cause: runtime-only issue not visible in unit tests.
- Fix:
  - inspect Vercel logs first.
  - avoid speculative fixes without matching a concrete log signature.

## Incident Playbook (Operational)

1. Reproduce with raw responses:
   - `curl -i https://<app>/api/sources`
   - `curl -i "https://<app>/api/news?page=1&limit=1000"`
2. Pull Vercel error logs:
   - `vercel logs <deployment-or-url> --no-follow --status-code 500 --since 2h --expand`
3. Classify by signature:
   - module system vs missing file vs export mismatch vs missing includeFiles.
4. Apply minimal, deterministic fix:
   - module boundary, runtime module extraction, `.js` extensions, `includeFiles`.
5. Validate locally (`lint`, `test`) and redeploy.
6. Verify production endpoints again with raw `curl -i`.
7. Re-check logs for new error signatures before applying another fix.

## Recommended Implementation Pattern for API Runtime Imports

1. Runtime constants and helpers in `src/lib/*` only.
2. Type-only structures in `src/interfaces/*`.
3. Runtime imports in `api/*` with explicit `.js`.
4. Avoid mixing runtime values and interfaces in the same file.

## Pre-PR Checklist for Vercel Fixes

- Error reproduced in production and log signature captured.
- Fix maps directly to a known signature.
- `api/package.json` and `src/package.json` boundaries are correct.
- Runtime imports in touched `api/*` files use `.js`.
- Local file dependencies required in runtime use `config.includeFiles`.
- `pnpm run lint` passes.
- `pnpm test -- --watch=false` passes.
- Production endpoints return `200` after deploy.

## Production Checklist

- `api/package.json` exists with `"type": "module"`.
- `src/package.json` exists with `"type": "module"` if serverless imports from `src/lib`.
- API runtime imports use `.js` extension.
- Runtime constants are in runtime modules, not interface files.
- Function file dependencies are bundled (`config.includeFiles` where needed).
- `/api/sources` and `/api/news` return `200` after deploy.

## Anti-Patterns (Avoid)

- Fixing multiple unrelated runtime hypotheses in one commit.
- Reading local files in runtime without `includeFiles`.
- Placing constants/enums used at runtime in interface/type files.
- Assuming local test pass implies serverless runtime pass.
- Ignoring Vercel log signature and debugging by guesswork.
