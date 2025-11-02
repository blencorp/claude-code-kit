#!/bin/bash

# Install skill-rules.json to target project
# Usage: ./scripts/install-skill-rules.sh /path/to/target/project

set -e

TARGET_DIR="${1:-.}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
SOURCE_FILE="$REPO_ROOT/.claude/skill-rules.json"

# Ensure source file exists
if [ ! -f "$SOURCE_FILE" ]; then
  echo "❌ Error: skill-rules.json not found at $SOURCE_FILE"
  echo "   Run: node scripts/merge-skill-rules.js"
  exit 1
fi

# Create .claude directory in target if it doesn't exist
TARGET_CLAUDE_DIR="$TARGET_DIR/.claude"
mkdir -p "$TARGET_CLAUDE_DIR"

# Copy skill-rules.json
TARGET_FILE="$TARGET_CLAUDE_DIR/skill-rules.json"
cp "$SOURCE_FILE" "$TARGET_FILE"

echo "✅ Installed skill-rules.json to:"
echo "   $TARGET_FILE"
echo ""
echo "Skills configured:"
cat "$TARGET_FILE" | jq -r '.skills | keys | .[]' | sed 's/^/   - /'
echo ""
echo "🎯 Skills will now auto-activate in this project!"
