# Tailwind CSS Kit

Tailwind CSS v4 utility-first styling patterns including responsive design, dark mode, and custom configuration.

## What This Kit Provides

**Skill:** `tailwindcss`

Covers:
- Utility-first CSS patterns
- Layout utilities (Flexbox, Grid, positioning)
- Responsive design with breakpoints
- Dark mode implementation
- Typography and spacing
- Color system and customization
- Tailwind v4 CSS-first configuration
- Component extraction patterns
- Performance optimization
- Custom theme configuration

## Auto-Detection

This kit is automatically detected if your project has Tailwind CSS:

```json
{
  "devDependencies": {
    "tailwindcss": "^4.0.0"
  }
}
```

Or if these files exist:
- `tailwind.config.js` / `tailwind.config.ts`
- `postcss.config.js`
- CSS files with `@tailwind` directives

## Installation

Auto-detected projects:
```bash
npx claude-code-setup --yes
```

Explicit installation:
```bash
npx claude-code-setup --kit tailwindcss
```

## Dependencies

**None** - Tailwind CSS kit is standalone and works with any framework.

Works well with:
- `react` - React components
- `nextjs` - Next.js applications
- `shadcn` - shadcn/ui component library

## Documentation

See [skills/tailwindcss/SKILL.md](skills/tailwindcss/SKILL.md) for complete patterns and examples.

## Tech Stack

- Tailwind CSS v4 (January 2025 release)
- CSS-first configuration with `@theme`
- OKLCH color format
- 3.5x faster builds than v3
- Supports both CSS-first and legacy tailwind.config.js
