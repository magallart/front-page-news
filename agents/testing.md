# Testing Agent

Specialized in testing, quality assurance, and regressions for Angular 21 applications.

This agent defines how tests are written, what is expected by default, and how testing effort is distributed between unit and e2e tests.

## Core Principles

- Tests are part of the design, not an afterthought.
- A change without a test is a potential regression.
- Prefer fast, deterministic tests over exhaustive ones.
- Readability and speed are more important than coverage numbers.

---

## Tooling (REQUIRED)

- **Unit tests**: Vitest (Angular 21).
- **End-to-end tests**: Playwright.
- Failing tests always block merges.

## Responsibilities

- Ensure every component and service has unit test coverage.
- Add or update tests when behavior changes.
- Keep the test suite fast, stable, and easy to understand.
- Prevent regressions without over-testing.

## Testing Strategy

### Unit Tests (PRIMARY)

- Unit tests are the default and preferred form of testing.
- Most behavior must be covered by unit tests.
- Unit tests should be fast enough to run frequently during development.

### Integration Tests

- Used when component behavior depends on multiple pieces working together.
- Prefer integration tests over complex mocking.

### End-to-End Tests (SECONDARY)

- Use e2e tests only for **critical user journeys**.
- Keep the e2e suite intentionally small.

## Minimum Coverage Expectations (REQUIRED)

### Components

Every component must have a unit test file covering:

- Component renders without crashing.
- Main UI state (happy path).
- One secondary state when applicable:
  - Empty
  - Loading
  - Error
- Primary user interaction:
  - Click
  - Submit
  - Emit output

### Services

Every service must have a unit test file covering:

- Happy path behavior.
- One obvious failure or error case (when applicable).

> The goal is **not exhaustive coverage initially**.  
> Start with a small, stable baseline and expand as behavior evolves.

## Test Size & Readability Rules (REQUIRED)

- Tests must be small, readable, and quick to execute.
- Prefer **2–6 focused assertions** over long “mega tests”.
- Use clear, intention-revealing names:
  - `should render empty state when no items`
  - `should emit value on submit`
  - `should return cached result`
- Follow **Arrange / Act / Assert** structure consistently.

## What to Test

- Public behavior and user-visible outcomes.
- Error and empty states.
- Regressions caused by previous bugs.

### What NOT to Test

- Private methods or internal implementation details.
- Framework internals.
- Styling details that are not behaviorally relevant.

## Signals Testing (Angular)

- Prefer testing **signal state changes** over DOM internals.
- Avoid lifecycle hooks in tests.
- Use `computed()` and `effect()` deterministically in assertions.
- Do not rely on timing-based assertions when signals can be observed directly.

## End-to-End (Playwright) Policy

### Purpose of E2E Tests

E2E tests exist to answer one question:

> “Does the application work as expected from a user perspective?”

### Focus Areas

- Visual and layout coherence.
- Navigation and routing correctness.
- Critical user flows (smoke tests).
- High-level “happy path” behavior across key pages.

### Avoid in E2E

- Duplicating unit test coverage.
- Testing every edge case via e2e.
- Overly granular DOM assertions.
- Heavy setup or fragile selectors.

## Performance & Stability Guidelines

- Prefer stable selectors (e.g. `data-testid`) in e2e tests.
- Avoid real network calls when possible:
  - Mock responses
  - Use predictable fixtures
- The full test suite should be runnable locally without heavy setup.

## Anti-Patterns (AVOID)

- Snapshot tests for complex UI by default.
- Over-mocking that makes tests meaningless.
- Long mock chains instead of simpler integration tests.
- Tests that pass but are hard to understand.

## AI Guardrails (REQUIRED)

- Do not generate snapshot tests unless explicitly requested.
- Do not generate large test files by default.
- Do not test private methods.
- Prefer clarity and intent over cleverness.

## Backlog and DoD Validation

- When `BACKLOG.md` is used, treat ticket DoD as a release gate.
- Before marking any ticket task as `[✔️]`, confirm:
  - relevant functional criteria are met
  - `pnpm run lint` passes
  - `pnpm test` passes
- If DoD is not met, keep tasks as `[ ]`.

## Commands

```bash
pnpm test
pnpm run lint
```
