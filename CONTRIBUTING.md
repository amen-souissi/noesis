# Contributing to Noesis

Thank you for your interest in contributing to Noesis! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

- Use the GitHub issue tracker
- Include a clear description of the problem
- Provide steps to reproduce
- Specify your environment (OS, Python/Node versions, Docker if applicable)

### Suggesting Features

- Open an issue with the `enhancement` label
- Describe the use case and expected behavior
- Discuss implementation ideas if you have any

### Pull Requests

1. **Fork** the repository and create a branch from `main`
2. **Follow the coding conventions** (see below)
3. **Write or update tests** when applicable
4. **Update documentation** if you change behavior
5. **Ensure tests pass** before submitting
6. **Write clear commit messages** (e.g., "Add X", "Fix Y in Z")

### Branch Naming

- `fix/` for bug fixes (e.g., `fix/websocket-reconnect`)
- `feat/` for new features (e.g., `feat/new-visualization`)
- `docs/` for documentation (e.g., `docs/readme-update`)
- `refactor/` for code refactoring

## Development Setup

See the [README.md](README.md) Quick Start section for setup instructions.

### Running Tests

```bash
# Python tests
pytest tests/ -v

# Frontend tests
cd frontend && npm run test
```

### Static Analysis (Lint & Format)

```bash
# Python (Ruff)
ruff check . --exclude frontend
ruff format . --check --exclude frontend
ruff check backend/
ruff format backend/ --check

# Frontend
cd frontend && npm run typecheck
cd frontend && npm run lint
cd frontend && npm run format:check
```

### Code Style

- **Python**: Follow PEP 8. Use meaningful variable names and docstrings.
- **TypeScript/React**: Use TypeScript strict mode. Prefer functional components and hooks.
- **Frontend content**: French for user-facing text; English for code and variable names.

### Project Structure Notes

- The LLM engine (`modules/`, `autograd/`, `optim/`) should **not** be modified for educational content changes—it is the reference implementation.
- Backend changes go in `backend/api/`
- Frontend educational content lives in `frontend/src/pages/` and `frontend/src/components/`

## Questions?

Feel free to open an issue for questions or discussions.
