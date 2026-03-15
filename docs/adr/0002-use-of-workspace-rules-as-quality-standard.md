# ADR 0002: Use of workspace rules as quality standard

## Status

Accepted.

## Context

The repository must maintain consistent quality, security, and architectural standards across projects. We need a single source of truth for these standards that both humans and tooling can reference.

## Decision

- Adopt the rules defined in `.cursor/rules/workspace-rules.mdc` as the **quality standard** for the CodeForge repository.
- These rules cover: layered architecture (domain, application, infrastructure, presentation), SOLID, testing (pyramid, determinism), security (OWASP, input validation, secrets), observability (structured logging, metrics), DevOps (CI/CD, Conventional Commits), and documentation (ADRs, API docs).
- New code and refactors should align with these rules; deviations are documented (e.g. in an ADR or comment) when necessary.

## Consequences

- Contributors and reviewers have a clear reference; PRs can be checked against the rules.
- Tooling (linters, formatters, pre-commit) is configured to support the rules (e.g. Black, Ruff, Prettier).
- Large legacy parts of the repo may not yet fully comply; we improve incrementally and track technical debt.
