# Copilot Instructions for Workbench

## General Rules
- **Respond in Japanese.** Even if the instructions are in English, the user communication should be in Japanese.

## Project Overview
This repository contains various experiments and "starters" for development.

## `prometheus-starter`
This directory contains a complete setup for Prometheus, Grafana, a Go application, and a load testing tool.

### Components
- **App**: A Go-based HTTP server with direct instrumentation using `prometheus/client_golang`. Metrics at `/metrics`.
- **k6**: A load testing tool that continuously sends requests to the app.
- **Monitoring**: Prometheus scrapes metrics; Grafana is pre-provisioned.

### Development & Maintenance
- Use `docker compose up` in `prometheus-starter` to start the stack.
- **Image Pinning**: All images in `compose.yaml` must be pinned with `sha256` digests for reproducibility. Use `scripts/fix-docker-compose-imagehash.sh` to update them.
- **CI**: GitHub Actions will fail if any `compose.yaml` contains unpinned images.

## Scripts
- `scripts/fix-docker-compose-imagehash.sh`: Automatically updates `:latest` or tagged images in Compose files to their `sha256` digests, adding the original tag as a comment.
- `scripts/check-unfixed-imagehash.sh`: Verifies that all images in a Compose file are pinned with `sha256`.

## `linear-pick-one`
A TypeScript tool to fetch tasks from a Linear custom view and pick one randomly.

### Usage
1. Set `LINEAR_API_KEY` environment variable
2. `pnpm fetch <linear-view-url>`: Fetch tasks and save to `linear/list-YYYY-MM-DD.md`
3. `pnpm pick`: Randomly select one task from the latest list

### Development
- Uses `@linear/sdk` for Linear API communication
- Run `pnpm typecheck` for type checking, `pnpm test` for tests
- Output directory `linear/` is gitignored
