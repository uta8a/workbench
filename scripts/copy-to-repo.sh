#!/bin/bash
set -euo pipefail

# Usage: ./scripts/copy-to-repo.sh <source-dir> <target-repo-path> [target-dir-name] [--dry-run]
# Example: ./scripts/copy-to-repo.sh source-directory ~/workspace/target-directory
# Example: ./scripts/copy-to-repo.sh source-directory ~/workspace/target-directory --dry-run

DRY_RUN=false

# Parse arguments
POSITIONAL_ARGS=()
for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            ;;
        *)
            POSITIONAL_ARGS+=("$arg")
            ;;
    esac
done

if [ ${#POSITIONAL_ARGS[@]} -lt 2 ]; then
    echo "Usage: $0 <source-dir> <target-repo-path> [target-dir-name] [--dry-run]"
    echo "Example: $0 source-directory ~/workspace/target-directory"
    echo "Example: $0 source-directory ~/workspace/target-directory --dry-run"
    exit 1
fi

SOURCE_DIR="${POSITIONAL_ARGS[0]}"
TARGET_REPO="${POSITIONAL_ARGS[1]}"
TARGET_DIR_NAME="${POSITIONAL_ARGS[2]:-$(basename "$SOURCE_DIR")}"

# Validate source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory '$SOURCE_DIR' does not exist"
    exit 1
fi

# Validate target repo exists (skip in dry-run mode)
if [ "$DRY_RUN" = false ] && [ ! -d "$TARGET_REPO" ]; then
    echo "Error: Target repository '$TARGET_REPO' does not exist"
    exit 1
fi

TARGET_PATH="$TARGET_REPO/$TARGET_DIR_NAME"

# Dry run mode: just list files
if [ "$DRY_RUN" = true ]; then
    echo "=== Dry Run Mode ==="
    echo "Source: $SOURCE_DIR"
    echo "Target: $TARGET_PATH"
    echo ""
    echo "Files to copy:"
    git ls-files "$SOURCE_DIR" | while read -r file; do
        rel_path="${file#$SOURCE_DIR/}"
        echo "  $file -> $TARGET_PATH/$rel_path"
    done
    echo ""
    file_count=$(git ls-files "$SOURCE_DIR" | wc -l)
    echo "Total: $file_count files"
    exit 0
fi

# Check if target already exists
if [ -d "$TARGET_PATH" ]; then
    echo "Warning: Target directory '$TARGET_PATH' already exists"
    read -p "Overwrite? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "Aborted"
        exit 0
    fi
    rm -rf "$TARGET_PATH"
fi

# Get list of git-tracked files in the source directory
echo "Copying git-tracked files from '$SOURCE_DIR' to '$TARGET_PATH'..."

# Use git ls-files to get only tracked files
git ls-files "$SOURCE_DIR" | while read -r file; do
    # Calculate relative path within source directory
    rel_path="${file#$SOURCE_DIR/}"
    target_file="$TARGET_PATH/$rel_path"
    
    # Create target directory if needed
    mkdir -p "$(dirname "$target_file")"
    
    # Copy the file
    cp "$file" "$target_file"
done

# Count copied files
file_count=$(git ls-files "$SOURCE_DIR" | wc -l)
echo "Copied $file_count files"

echo "Done!"
echo ""
echo "Next steps:"
echo "  cd $TARGET_REPO"
echo "  git add $TARGET_DIR_NAME"
echo "  git commit -m 'Add $TARGET_DIR_NAME from workbench'"
