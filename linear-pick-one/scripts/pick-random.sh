#!/bin/bash
set -euo pipefail

# Find the latest list-*.md file in linear/ directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LINEAR_DIR="${SCRIPT_DIR}/../linear"

if [ ! -d "$LINEAR_DIR" ]; then
  echo "Error: linear/ directory not found. Run 'pnpm fetch <view-url>' first." >&2
  exit 1
fi

# Find the latest list file
LATEST_FILE=$(find "$LINEAR_DIR" -name 'list-*.md' -type f | sort -r | head -n 1)

if [ -z "$LATEST_FILE" ]; then
  echo "Error: No list-*.md files found in linear/ directory." >&2
  exit 1
fi

echo "Reading from: $LATEST_FILE"
echo ""

# Extract task blocks (## TASK-ID sections)
# Each task starts with ## and contains Title and URL
TASKS=$(grep -E '^## [A-Z]+-[0-9]+' "$LATEST_FILE" | sed 's/^## //')

if [ -z "$TASKS" ]; then
  echo "Error: No tasks found in the file." >&2
  exit 1
fi

# Count tasks
TASK_COUNT=$(echo "$TASKS" | wc -l)
echo "Found $TASK_COUNT tasks."
echo ""

# Pick a random task
RANDOM_INDEX=$((RANDOM % TASK_COUNT + 1))
SELECTED_TASK=$(echo "$TASKS" | sed -n "${RANDOM_INDEX}p")

echo "🎲 Randomly selected task:"
echo "=========================="

# Find the task details in the file
# Extract the section for this task
awk "/^## ${SELECTED_TASK}$/,/^## [A-Z]+-[0-9]+$|^$/" "$LATEST_FILE" | head -n -1

echo ""
echo "=========================="
