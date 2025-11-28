# Next.js Kit

Next.js 15+ App Router development patterns including Server Components, Client Components, data fetching, layouts, and server actions.

## What This Kit Provides

**Skill:** `nextjs`

Covers:
- Server Components and Client Components
- File-based routing with App Router
- Data fetching patterns (async/await in Server Components)
- Layouts and nested routes
- Route handlers (API routes)
- Server actions for mutations
- Metadata and SEO
- Loading states and error boundaries
- Streaming and parallel data fetching
- Dynamic routes and route parameters

## Auto-Detection

This kit is automatically detected if your project has Next.js in `package.json`:

```json
{
  "dependencies": {
    "next": "^15.0.0"
  }
}
```

## Installation

Auto-detected projects:
```bash
npx claude-code-setup --yes
```

Explicit installation:
```bash
npx claude-code-setup --kit nextjs
```

## Dependencies

**Required:**
- `react` - React kit is required for Next.js development

Works well with:
- `shadcn` - shadcn/ui components
- `tailwindcss` - Tailwind CSS styling
- `tanstack-query` - Data fetching and caching
- `prisma` - Database ORM

## Documentation

See [skills/nextjs/SKILL.md](skills/nextjs/SKILL.md) for complete patterns and examples.

## Tech Stack

- Next.js 15+
- App Router
- React Server Components
- TypeScript
- Server-first architecture
