# Repository Guidelines

## Project Structure & Module Organization
This repository is a small monorepo for development playgrounds.

- `linear-pick-one/`: TypeScript CLI to fetch tasks from a Linear custom view and pick one task.
- `prometheus-starter/`: Monitoring demo stack (Go app + Prometheus + Grafana + k6).
- `scripts/`: Repository-wide maintenance scripts (for example image hash checks/fixes and copy helpers).
- `.github/workflows/`: CI for each module and repository policy checks.
- `mise.toml`: Pinned toolchain versions (`go`, `node`, `pnpm`, `yq`, `pinact`).

## Build, Test, and Development Commands
Run commands from the repository root unless noted.

- `mise install`: Install pinned tool versions.
- `cd linear-pick-one && pnpm install --frozen-lockfile`: Install JS dependencies.
- `cd linear-pick-one && pnpm typecheck`: Run strict TypeScript checks.
- `cd linear-pick-one && pnpm test`: Run Vitest tests once.
- `cd linear-pick-one && pnpm build`: Compile to `dist/`.
- `cd prometheus-starter/app && go test -v ./...`: Run Go unit tests.
- `cd prometheus-starter && docker compose up -d`: Start integration stack locally.
- `./scripts/check-unfixed-imagehash.sh <compose-file>`: Verify images are SHA-pinned.

## Coding Style & Naming Conventions
- TypeScript: 2-space indentation, ES modules, `strict` mode must stay enabled.
- Go: Follow `gofmt` defaults and idiomatic Go naming.
- Tests: keep test files colocated with code (`*.test.ts`, `*_test.go`).
- Scripts: Bash with `set -e`/`set -euo pipefail` where possible.
- Keep module boundaries clear; avoid cross-module coupling between `linear-pick-one` and `prometheus-starter`.

## Testing Guidelines
- `linear-pick-one` uses `vitest` (`vitest run` in CI).
- `prometheus-starter/app` uses Go’s standard `testing` package.
- Add tests for behavior changes and bug fixes before merging.
- For Compose changes, ensure images are pinned to `@sha256:...` digests or CI will fail.

## Commit & Pull Request Guidelines
- Use Conventional-Commit-like prefixes seen in history: `feat:`, `fix:`, `chore:`, `docs:`, `ci:`, `test:` (optional scope, e.g. `fix(linear-pick-one): ...`).
- Keep commits focused and reviewable.
- PRs should include:
  - What changed and why.
  - Affected module(s).
  - Verification steps/outputs (for example `pnpm test`, `go test`, or compose health checks).
  - Linked issue(s) when applicable.

## Security & Configuration Tips
- Never commit secrets. Set `LINEAR_API_KEY` via environment variables (for example in your shell profile or CI secrets).
- Avoid printing API keys in logs, scripts, or test output.
- Keep Docker images pinned to `@sha256` digests in Compose files; run `./scripts/check-unfixed-imagehash.sh` before opening a PR.
- When updating pinned images, use `./scripts/fix-docker-compose-imagehash.sh` and review the generated digest changes.
