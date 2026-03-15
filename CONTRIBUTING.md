# Contributing to CodeForge

Thank you for your interest in contributing to CodeForge. This document explains how to get started, run tests, and submit changes.

## Code of Conduct

By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## Repository structure

CodeForge is a portfolio monorepo with multiple independent projects:

- **ChallengesDev** – Programming challenges in Python, Java, and C++
- **WhatsappBot** – WhatsApp bot with Groq (hexagonal architecture)
- **WhatsAppAssistant** – Personal WhatsApp assistant with RAG (pgvector)
- **Veronica** – J.A.R.V.I.S.-style assistant (LangChain, WebSockets)
- **TheoreticalResearch** – LaTeX papers and climate analysis (Don Bosco)

Each project has its own dependencies and run instructions. See each project's README for setup.

## Getting started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jhuomar-Barria/Code-Forge.git
   cd Code-Forge
   ```

2. **Choose the project** you want to work on and follow its README (e.g. `WhatsappBot/README.md`, `ChallengesDev/README.md`).

3. **Install dependencies** as described in that project (e.g. `pip install -r requirements.txt`, `npm install`).

4. **Optional: install pre-commit** (recommended for consistent formatting and linting):
   ```bash
   pip install pre-commit
   pre-commit install
   ```
   This runs Black, Ruff, Prettier, and common file checks on commit. See [.pre-commit-config.yaml](.pre-commit-config.yaml). Repository docs: [docs/env-reference.md](docs/env-reference.md), [docs/adr/](docs/adr/).

5. **Run tests** before making changes:
   - **ChallengesDev (Python)**: `pytest` in the challenge folder or from `ChallengesDev/Python`
   - **WhatsappBot**: `pytest tests/` from `WhatsappBot`
   - **Veronica**: `pytest` from `Veronica/backend`
   - **WhatsAppAssistant**: `npm test` from `WhatsAppAssistant/backend` (if configured)

## Commit messages (Conventional Commits)

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear history and automated tooling.

Format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

- **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **scope**: optional; project or area (e.g. `whatsapp-bot`, `challenges-dev`, `veronica`)
- **description**: imperative, lowercase after the colon

Examples:

- `feat(whatsapp-bot): add Redis rate limiter`
- `fix(veronica): WebSocket heartbeat timeout`
- `docs(challenges-dev): add complexity to README for 009-sudoku`
- `test(whatsapp-bot): add integration test for webhook signature`

Keep the summary line under 72 characters. Add a body when the change needs explanation.

## Pull requests

1. Create a branch from `main`: `git checkout -b feature/short-description` or `fix/short-description`.
2. Make your changes; keep commits focused and messages following Conventional Commits.
3. Run the relevant tests and linters (see project README and CI).
4. Push and open a Pull Request. Describe what changed and why.
5. Ensure CI passes. Address review comments.

## Quality and standards

This repository follows the workspace rules in [.cursor/rules/workspace-rules.mdc](.cursor/rules/workspace-rules.mdc) for architecture, security, testing, and documentation. When contributing:

- Prefer small, reviewable changes.
- Add or update tests for new or changed behavior.
- Update documentation (README, API docs, ADRs) when behavior or setup changes.
- Do not commit secrets or real credentials; use `.env.example` as a template only.

## Questions

Open an issue or contact the maintainer (see [README](README.md) for contact details).
