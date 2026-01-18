#!/bin/bash
set -e

# Support filename as argument, default to compose.yaml then docker-compose.yml
FILE="${1:-}"
if [[ -z "$FILE" ]]; then
  if [[ -f "compose.yaml" ]]; then
    FILE="compose.yaml"
  elif [[ -f "docker-compose.yml" ]]; then
    FILE="docker-compose.yml"
  else
    echo "Usage: $0 [compose-file]"
    exit 1
  fi
fi

if [[ ! -f "$FILE" ]]; then
  echo "Error: File $FILE not found"
  exit 1
fi

echo "Checking $FILE for unfixed image hashes..."

# Get all images defined in the compose file
# yq -r '.. | select(has("image")) | .image' returns all image values
UNFIXED_IMAGES=$(yq -r '.. | select(has("image")) | .image' "$FILE" | grep -v -E "@sha256:[a-f0-9]{64}$" || true)

if [[ -n "$UNFIXED_IMAGES" ]]; then
  echo "Error: Found images without pinned sha256 hashes:"
  echo "$UNFIXED_IMAGES"
  exit 1
fi

echo "All images are properly pinned with sha256 hashes."
exit 0
