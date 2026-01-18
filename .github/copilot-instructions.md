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
