# shadcn/ui Kit

shadcn/ui component library patterns with Radix UI primitives and Tailwind CSS.

## What This Kit Provides

**Skill:** `shadcn`

Covers:
- Component installation and usage (copy-paste, not npm)
- shadcn/ui components (Button, Card, Dialog, Table, Form, etc.)
- Forms with react-hook-form and Zod validation
- Data tables with sorting and filtering
- Dialogs and modals
- Accessible components with Radix UI
- Component customization patterns
- Troubleshooting npm cache issues

## Auto-Detection

This kit is automatically detected if your project has shadcn components:

- `components/ui/` directory exists
- `components.json` configuration file exists
- `@/components/ui` imports in code

## Installation

Auto-detected projects:
```bash
npx claude-code-setup --yes
```

Explicit installation:
```bash
npx claude-code-setup --kit shadcn
```

## Dependencies

**Required:**
- `react` - React kit is required
- `tailwindcss` - Tailwind CSS kit is required (shadcn uses Tailwind for styling)

Works well with:
- `nextjs` - Next.js App Router
- `tanstack-query` - Data fetching in forms and tables

## Documentation

See [skills/shadcn/SKILL.md](skills/shadcn/SKILL.md) for complete patterns and examples.

## Tech Stack

- shadcn/ui (latest)
- Radix UI primitives
- Tailwind CSS
- react-hook-form
- Zod validation
- TypeScript
- ARIA-accessible components
