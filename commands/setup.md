---
description: Detect project frameworks and recommend plugins to install
---

# Project Setup - Framework Detection

Analyze this project to detect which frameworks and libraries are in use, then recommend the appropriate Claude Code Kit plugins to install.

## Detection Rules

Run these checks to detect frameworks. For monorepos, check both root and workspace directories (apps/*, packages/*, services/*).

### Frontend Frameworks

**Next.js** - Check for:
- `package.json` containing `"next"` dependency
- `next.config.js` or `next.config.mjs` or `next.config.ts` file
- `app/` directory with `layout.tsx` or `page.tsx`

**React** - Check for:
- `package.json` containing `"react"` dependency
- `.tsx` or `.jsx` files with React imports

**TailwindCSS** - Check for:
- `package.json` containing `"tailwindcss"` dependency
- `tailwind.config.js` or `tailwind.config.ts` file

**shadcn/ui** - Check for:
- `components.json` file (shadcn config)
- `package.json` containing `"@radix-ui"` dependencies

**Material-UI** - Check for:
- `package.json` containing `"@mui/material"` dependency

**TanStack Router** - Check for:
- `package.json` containing `"@tanstack/react-router"` dependency

**TanStack Query** - Check for:
- `package.json` containing `"@tanstack/react-query"` dependency

### Backend Frameworks

**Express** - Check for:
- `package.json` containing `"express"` dependency

**Node.js** (general patterns) - Check for:
- `package.json` exists
- Server-side TypeScript/JavaScript files

**Prisma** - Check for:
- `package.json` containing `"prisma"` or `"@prisma/client"` dependency
- `prisma/schema.prisma` file

## Output Format

After detection, output results in this format:

```
## Detected Frameworks

✓ Next.js 15 (found in package.json)
✓ React 18 (found in package.json)
✓ TailwindCSS (found tailwind.config.ts)
✓ Prisma (found prisma/schema.prisma)

## Recommended Plugins

To install these plugins from the claude-code-kit marketplace:

1. First, add the marketplace (if not already added):
   /plugin marketplace add blencorp/claude-code-kit

2. Then install the detected plugins:
   /plugin install nextjs react tailwindcss prisma

## Available Plugins

The claude-code-kit marketplace includes:

| Plugin | Description |
|--------|-------------|
| nextjs | Next.js 15+ App Router patterns |
| react | React 18+ hooks and component patterns |
| express | Express.js routing and middleware |
| nodejs | Node.js service layer patterns |
| prisma | Prisma ORM and database patterns |
| tailwindcss | Tailwind CSS v4 utility patterns |
| shadcn | shadcn/ui component library |
| mui | Material-UI v7 components |
| tanstack-query | TanStack Query data fetching |
| tanstack-router | TanStack Router file-based routing |
```

## Instructions

1. Read the project's `package.json` file(s) to check dependencies
2. Look for framework-specific config files
3. For monorepos, check common workspace patterns (apps/*, packages/*)
4. Output the detected frameworks and installation commands
5. Be helpful - explain what each plugin provides
