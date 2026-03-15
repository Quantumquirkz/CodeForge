# ADR 0001: Monorepo layout and per-project independence

## Status

Accepted.

## Context

CodeForge is a portfolio repository containing multiple independent projects (ChallengesDev, WhatsappBot, WhatsAppAssistant, Veronica, TheoreticalResearch). We need a clear policy for layout, dependencies, and CI so that each project can be developed and deployed without unnecessary coupling.

## Decision

- **Layout**: Keep a flat monorepo at the root; each project lives in its own top-level directory with its own dependencies (e.g. `WhatsappBot/requirements.txt`, `WhatsAppAssistant/backend/package.json`).
- **Independence**: Projects do not depend on each other. Shared standards are enforced via root-level tooling (pre-commit, CI) and documentation (CONTRIBUTING.md, workspace rules).
- **CI**: A single workflow (`.github/workflows/ci.yml`) runs lint and tests for each project in parallel; dependency scanning runs once for all Python and Node workspaces. No cross-project build steps.

## Consequences

- Contributors can work on one project without installing others.
- CI may duplicate some setup (e.g. multiple Python/Node jobs) but remains under one workflow file.
- New projects are added by creating a new top-level directory and optionally extending the CI matrix.
