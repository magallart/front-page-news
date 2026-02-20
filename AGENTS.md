# AGENTS.md

This file defines the global rules, conventions, and agent routing for AI-assisted development.

All agents inside the `agents/` directory must follow the rules defined here.  
Agent-specific rules extend (but never override) this file.

## Purpose

Ensure consistent, high-quality development using AI agents without introducing unnecessary complexity, technical debt, or unclear ownership.

This file acts as the **single source of truth** for global conventions and decision-making rules.

## Global Conventions

- Use **pnpm** for all package management:
  - pnpm install
  - pnpm run dev
  - pnpm run build
  - pnpm test
- TypeScript is mandatory.
- Prefer ESM and modern browser syntax.
- Tailwind CSS is the only styling solution.
- Icons must come from tabler-icons:
  - https://tabler.io/icons
  - Explicit imports only.
  - No barrel imports.
  - Implement icons as SVG components in `src/app/components/icons`.
- Enable TypeScript strict mode from the beginning.
- Do not add dependencies until they are strictly necessary.

## Code Organization

- Small components with a single responsibility.
- Prefer composition over complex configuration.
- Avoid premature abstractions.
- Do not create one folder per component by default.
- Create a dedicated folder for a component only when it grows beyond simple scope (multiple related files/helpers/variants) or becomes reused across multiple pages.
- Shared code must live in clear directories:
  - components
  - layouts
  - lib
  - utils

## TypeScript Rules

- Avoid **any**.
- `unknown` is allowed **only** when immediately narrowed (type guards, `zod`, manual checks).
- Prefer type inference whenever possible.
- Interfaces must be one-per-file and stored under an `interfaces` directory.
- Only allow a nested/local interface when it is used exclusively inside that same file scope.
- If types are unclear:
  - Stop.
  - Clarify before continuing.
- No work should proceed based on guessed or implicit types.

## UI, Styling, and Accessibility

- Tailwind CSS is mandatory and exclusive.
- Do not duplicate Tailwind classes if a component can be extracted.
- Prefer readability over micro-optimizations.
- Accessibility is not optional:
  - Use semantic HTML first.
  - Add ARIA roles only when necessary.
  - Ensure proper focus management and keyboard navigation.

## App Design Profile (REQUIRED)

- This repository includes a default `DESIGN.md` at the repo root.
- Before creating or modifying UI, always read `DESIGN.md` and follow it:
  - colors, typography, spacing, and component recipes.
- When starting a new application from this template:
  - `DESIGN.md` must be updated to match the new app’s brand identity.
- If `DESIGN.md` conflicts with generic UI guidance, `DESIGN.md` wins for visuals.
  - Global constraints still apply (Tailwind-only, no hex colors, etc.).

## Testing and Quality

- All code must pass:
  - Type checking.
  - Linting.
  - Tests.
- No code with failing checks is acceptable.
- When behavior changes:
  - Tests must be added or updated.
  - Even if not explicitly requested.

## Performance and Technical Decisions

- Never guess performance, bundle size, or load times.
- Measure before optimizing.
- Add instrumentation before making performance changes.
- Validate changes on a small scope before scaling them project-wide.

## Git, Commits, and Pull Requests

- Pull Requests must be small and focused.
- Keep `main` always deployable and production-ready.
- Work in short-lived branches; do not develop unfinished features directly on `main`.
- Branch naming must include ticket id and intent:
  - `feat/fpn-###-short-summary`
  - `fix/fpn-###-short-summary`
  - `refactor/fpn-###-short-summary`
  - `docs/fpn-###-short-summary`
- Always use conventional commits.
- Prefer atomic commits: one logical change per commit.
- Do not group unrelated file changes in a single commit.
- Never create commits without explicit user approval in the current conversation.
- Commit or push actions are allowed only after the user explicitly asks for them.
- Global commit approval rule: before every `git commit`, always ask for explicit confirmation in that exact moment.
  This rule is permanent and does not depend on user reminders.
- Commit and PR descriptions must be explicit and self-contained, not terse.
- Avoid vague messages like "fix stuff", "updates", or "cleanup".
- If the project uses `BACKLOG.md`, commit subjects must include the ticket id.
- Required commit subject format with ticket: `type(scope): [TICKET-ID] explicit summary`.
- PR title format:
  - [<project_name>] Clear and concise description.
- PR body should follow `.github/pull_request_template.md`.
- Before committing or opening a PR:
  - pnpm run lint.
  - pnpm test.
- PR descriptions must be concise and focused on a high-level summary of what changed.
- If a new global restriction is introduced (e.g. “never X”, “always Y”), it must be documented **in this file**.

## Agent Behavior Rules

- If a request is unclear, ask precise and concrete questions before acting.
- Simple, well-defined tasks may be executed directly.
- Complex changes (refactors, new features, architectural decisions) require confirmation of understanding before execution.
- Never assume implicit requirements.
- If critical information is missing, stop and request it.

## Session Continuity

- Maintain a root `SESSION.md` file for short daily session logs.
- Before ending a session, append a brief summary of the current session to `SESSION.md`.
- Each session entry should include:
  - Date
  - What changed

## Backlog Workflow

- If `BACKLOG.md` exists, tickets created with `/plan` must include a task checklist.
- Checklist status format is mandatory:
  - `[ ]` pending task
  - `[✔️]` completed task
- A task can be marked as `[✔️]` only when its ticket DoD is satisfied.

## Agent Routing

| Task Type                                     | Agent                    |
| --------------------------------------------- | ------------------------ |
| Architecture, boundaries, ADRs                | `agents/architecture.md` |
| Angular-specific development                  | `agents/angular.md`      |
| UI structure & UX (framework-agnostic)        | `agents/frontend.md`     |
| Tailwind usage, class strategy, cn() patterns | `agents/tailwind.md`     |
| TypeScript patterns & typing rules            | `agents/typescript.md`   |
| Performance, perf budgets, lazy loading       | `agents/performance.md`  |
| Tests, regressions, QA                        | `agents/testing.md`      |
| Git workflow, commits, PR hygiene             | `agents/git.md`          |
| Vercel deployment and serverless runtime      | `agents/vercel.md`       |

## Final Notes

- This file defines global rules.
- Agent files define specialized responsibilities.
- In case of conflict, AGENTS.md always takes precedence.
