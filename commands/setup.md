---
description: Detect project frameworks and install the appropriate plugins automatically
---

# Project Setup - Framework Detection & Installation

Analyze this project to detect which frameworks and libraries are in use, then **install the appropriate plugins automatically**.

## Detection Rules

Run these checks to detect frameworks. For monorepos, check both root and workspace directories (apps/*, packages/*, services/*).

### Frontend Frameworks

**Next.js** (`nextjs` plugin) - Check for:
- `package.json` containing `"next"` dependency
- `next.config.js` or `next.config.mjs` or `next.config.ts` file

**React** (`react` plugin) - Check for:
- `package.json` containing `"react"` dependency

**TailwindCSS** (`tailwindcss` plugin) - Check for:
- `package.json` containing `"tailwindcss"` dependency
- `tailwind.config.js` or `tailwind.config.ts` file

**shadcn/ui** (`shadcn` plugin) - Check for:
- `components.json` file (shadcn config)
- `package.json` containing `"@radix-ui"` dependencies

**Material-UI** (`mui` plugin) - Check for:
- `package.json` containing `"@mui/material"` dependency

**TanStack Router** (`tanstack-router` plugin) - Check for:
- `package.json` containing `"@tanstack/react-router"` dependency

**TanStack Query** (`tanstack-query` plugin) - Check for:
- `package.json` containing `"@tanstack/react-query"` dependency

### Backend Frameworks

**Express** (`express` plugin) - Check for:
- `package.json` containing `"express"` dependency

**Node.js** (`nodejs` plugin) - Check for:
- `package.json` with `"type": "module"` and a backend framework

**Prisma** (`prisma` plugin) - Check for:
- `package.json` containing `"prisma"` or `"@prisma/client"` dependency
- `prisma/schema.prisma` file

## Instructions

1. Read the project's `package.json` file(s) to check dependencies
2. Look for framework-specific config files
3. For monorepos, check common workspace patterns (apps/*, packages/*, services/*)
4. Show the user what was detected
5. **Install all detected plugins using `/plugin install <plugin-names>`**

## Output Format

After detection, show results and install:

```
## Detected Frameworks

✓ Next.js (found "next" in package.json)
✓ React (found "react" in package.json)
✓ TailwindCSS (found tailwind.config.ts)
✓ Prisma (found prisma/schema.prisma)

## Installing Plugins

Installing: nextjs, react, tailwindcss, prisma
```

Then run:
```
/plugin install nextjs react tailwindcss prisma
```

## Important

- **Do the installation automatically** - don't just show recommendations
- If no frameworks are detected, inform the user and list available plugins
- For monorepos, detect across all workspaces and install all relevant plugins
