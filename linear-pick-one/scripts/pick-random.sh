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
# Extract the section for this task using grep with line numbers
START_LINE=$(grep -n "^## ${SELECTED_TASK}$" "$LATEST_FILE" | cut -d: -f1)
if [ -n "$START_LINE" ]; then
  # Find the next section or end of file
  NEXT_SECTION_LINE=$(tail -n +$((START_LINE + 1)) "$LATEST_FILE" | grep -n "^## " | head -n 1 | cut -d: -f1)
  if [ -n "$NEXT_SECTION_LINE" ]; then
    END_LINE=$((START_LINE + NEXT_SECTION_LINE - 1))
    sed -n "${START_LINE},${END_LINE}p" "$LATEST_FILE"
  else
    # No next section, print to end of file
    tail -n +"$START_LINE" "$LATEST_FILE"
  fi
fi

echo "=========================="
