#!/bin/bash
set -e

DRY_RUN=false
FILE=""

# Parse arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -n|--dry-run) DRY_RUN=true ;;
    *) FILE="$1" ;;
  esac
  shift
done

# Default file search
if [[ -z "$FILE" ]]; then
  if [[ -f "compose.yaml" ]]; then
    FILE="compose.yaml"
  elif [[ -f "docker-compose.yml" ]]; then
    FILE="docker-compose.yml"
  else
    echo "Usage: $0 [-n|--dry-run] [compose-file]"
    exit 1
  fi
fi

if [[ ! -f "$FILE" ]]; then
  echo "Error: File $FILE not found"
  exit 1
fi

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

while IFS= read -r line; do
  # Use yq to strictly match the 'image' key
  IMAGE_VAL=$(echo "$line" | yq '.image' - 2>/dev/null || true)
  if [[ -n "$IMAGE_VAL" && "$IMAGE_VAL" != "null" ]]; then
    INDENT=$(echo "$line" | sed -E 's/^([[:space:]]*).*/\1/')
    
    # Extract base image name (remove tag or digest)
    # Handles: name, name:tag, name@sha256:hash, name:tag@sha256:hash, and registry with port
    if [[ "$IMAGE_VAL" =~ ^(.*)@sha256:.* ]]; then
      BASE_NAME_WITH_TAG="${BASH_REMATCH[1]}"
    else
      BASE_NAME_WITH_TAG="$IMAGE_VAL"
    fi
    # Remove tag if exists (but watch out for registry port)
    if [[ "$BASE_NAME_WITH_TAG" =~ ^(.*):([^/]+)$ ]]; then
      BASE_NAME="${BASH_REMATCH[1]}"
      TAG="${BASH_REMATCH[2]}"
    else
      BASE_NAME="$BASE_NAME_WITH_TAG"
      TAG="latest"
    fi
    
    # We want to find the specific version/tag of this image
    TARGET_IMAGE="${BASE_NAME}:${TAG}"
    
    # Get the digest for the target image using docker
    DIGEST=$(docker manifest inspect "$TARGET_IMAGE" --verbose 2>/dev/null \
      | jq -r 'if type=="array" then .[0].Descriptor.digest else .Descriptor.digest end')
    
    if [[ -z "$DIGEST" || "$DIGEST" == "null" ]]; then
      echo "$line"
    else
      # Comment with the actual tag used
      echo "${INDENT}image: ${BASE_NAME}@${DIGEST} # ${BASE_NAME}:${TAG}"
    fi
  else
    echo "$line"
  fi
done < "$FILE" > "$TMP"

if [ "$DRY_RUN" = true ]; then
  cat "$TMP"
else
  cp "$TMP" "$FILE" || { echo "Error: Failed to update '$FILE'. Please check your write permissions." >&2; exit 1; }
fi
