---
description: Map edited routes & launch tests
argument-hint: "[/extra/path …]"
allowed-tools: Bash(cat:*), Bash(awk:*), Bash(grep:*), Bash(sort:*), Bash(xargs:*), Bash(sed:*)
model: sonnet
---

## Context

Changed route files this session (auto-generated):

!cat "$CLAUDE_PROJECT_DIR/.claude/tsc-cache"/\*/edited-files.log 2>/dev/null | awk -F: '{print $2}' | grep '/routes/' | sort -u || echo "No route files modified yet"

User-specified additional routes: `$ARGUMENTS`

## Your task

Follow the numbered steps **exactly**:

1. Combine the auto list with `$ARGUMENTS`, dedupe, and resolve any prefixes
   defined in `src/app.ts`.
2. For each final route, output a JSON record with the path, method, expected
   request/response shapes, and valid + invalid payload examples.
3. **Use the Task tool to launch the auth-route-tester agent** with:
   - subagent_type: `auth-route-tester`
   - description: `route smoke tests`
   - prompt: `Test all the routes identified above. For each route, verify it exists, test with valid authentication and payloads, test error cases, and verify database records are created correctly.`
