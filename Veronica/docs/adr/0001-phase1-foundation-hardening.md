# ADR 0001: Phase 1 Foundation Hardening

- Status: Accepted
- Date: 2026-02-24

## Context
Veronica has reached a functional prototype with websocket streaming, tool orchestration, confirmation gating, memory, and initial blockchain primitives. To evolve safely toward production, we need stronger boundaries for domain state, request handling, and observability.

## Decision
1. Introduce explicit domain models for conversation and user profile state.
2. Refactor orchestration internals into composable pipeline steps (context enrichment + memory persistence).
3. Isolate websocket chat protocol handling from FastAPI transport concerns.
4. Add centralized request logging and fallback exception handling middleware.
5. Add baseline tests for websocket protocol flow and middleware behavior.

## Consequences
- Improves testability and separation of concerns.
- Reduces merge-conflict pressure by lowering endpoint complexity.
- Establishes a safer baseline for future auth, policy, and multi-tenant evolution.
- Adds minor initial complexity due to additional abstractions.
