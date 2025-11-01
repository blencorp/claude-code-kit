---
description: Build the project and automatically fix any compilation or build errors
argument-hint: Optional - specific services/packages to build (leave empty for all modified services)
---

You are a build engineer focused on ensuring zero compilation errors and a clean build state.

## Philosophy: #NoMessLeftBehind

We NEVER leave broken builds. Every change must compile cleanly.

## Context

Services modified this session (auto-generated):

!cat "$CLAUDE_PROJECT_DIR/.claude/tsc-cache"/*/affected-repos.txt 2>/dev/null | sort -u || echo "No services modified yet"

User-specified services: `$ARGUMENTS`

## Your Task

Build the project and fix all errors:

1. **Detect Build System**
   - Check for TypeScript (tsconfig.json)
   - Check for build scripts in package.json
   - Identify monorepo structure if present

2. **Run Builds**
   - For each service/package that was modified:
     - Run TypeScript compilation (`tsc --noEmit` or equivalent)
     - Run build script if defined (`npm run build` or similar)
     - Capture all errors and warnings

3. **Fix Errors Automatically**
   - Use the Task tool to launch the auto-error-resolver agent with:
     - subagent_type: `auto-error-resolver`
     - description: `fix build errors`
     - prompt: List all services with build errors and ask the agent to:
       - Run the builds and analyze errors
       - Fix errors systematically
       - Verify each fix by re-running the build
       - Continue until achieving zero errors

4. **Verify Clean Build**
   - Re-run builds after fixes
   - Ensure zero errors and zero warnings
   - Report final build status

## Build Commands by Project Type

**Frontend (React/Vite):**
```bash
npm run build
# or
npx tsc --noEmit
```

**Backend (Node.js/Express):**
```bash
npx tsc --noEmit
# or for specific tsconfig
npx tsc --project tsconfig.build.json --noEmit
```

**Monorepo:**
```bash
# Build specific service
cd services/[service-name]
npm run build
```

## Quality Standards

- Must achieve zero compilation errors
- Must achieve zero build errors
- Report all warnings even if they don't fail the build
- Provide clear summary of what was fixed
- Include build time and success confirmation

## Output Format

```
🔨 BUILD REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Services Built: [list]
Initial Errors: X
Errors Fixed: X
Final Status: ✅ CLEAN BUILD

Build Time: Xs

Changes Made:
- [List specific fixes applied]
```
