# Claude Code Kit

**Claude Code infrastructure with auto-activating skills and framework-specific kits.**

Install complete Claude Code infrastructure in 30 seconds with automatic framework detection and skill auto-activation.

## Quick Start

```bash
npx github:blencorp/claude-code-kit
```

**What happens:**
1. Detects your frameworks (Next.js, React, Express, Prisma, etc.)
2. Asks which kits to install
3. Copies hooks, agents, commands, and skills to `.claude/`
4. Configures automatic skill activation via `skill-rules.json`
5. Installs everything in < 30 seconds

**Result:** Skills automatically activate when you need them based on your prompts, file edits, and technology usage.

---

## What's a Kit?

A **kit** is a framework-specific package that includes:
- **Skill** - Best practices, patterns, and examples for the framework
- **Auto-activation triggers** - Keywords and patterns that activate the skill
- **Resources** - Detailed guides organized by topic
- **Detection logic** - Automatic framework detection

When installed, kits make Claude Code an expert in your stack.

---

## Available Kits

### Frontend Kits

| Kit | Description | Documentation |
|-----|-------------|---------------|
| **Next.js** | Next.js 15+ App Router, Server Components, Server Actions | [README](cli/kits/nextjs/README.md) |
| **React** | React 19 hooks, Suspense, lazy loading, TypeScript patterns | [README](cli/kits/react/README.md) |
| **shadcn/ui** | shadcn/ui component library with Tailwind CSS | [README](cli/kits/shadcn/README.md) |
| **Tailwind CSS** | Tailwind v4 utilities, responsive design, theming | [README](cli/kits/tailwindcss/README.md) |
| **Material-UI** | MUI v7 components, sx prop styling, theming | [README](cli/kits/mui/README.md) |
| **TanStack Router** | File-based routing, loaders, type-safe navigation | [README](cli/kits/tanstack-router/README.md) |
| **TanStack Query** | Data fetching with useSuspenseQuery, cache management | [README](cli/kits/tanstack-query/README.md) |

### Backend Kits

| Kit | Description | Documentation |
|-----|-------------|---------------|
| **Express** | Express.js routing, middleware, controllers | [README](cli/kits/express/README.md) |
| **Node.js** | Layered architecture, async patterns, error handling | [README](cli/kits/nodejs/README.md) |
| **Prisma** | Prisma ORM query patterns, repository pattern, transactions | [README](cli/kits/prisma/README.md) |

**All kits are auto-detected during installation based on your package.json and project structure.**

---

## Core Infrastructure

Every installation includes:

### Hooks (6)

**Essential (Auto-configured):**
- **skill-activation-prompt** (UserPromptSubmit) - Analyzes prompts and suggests relevant skills automatically
- **post-tool-use-tracker** (PostToolUse) - Tracks file changes to maintain context across sessions

**Optional (Requires customization):**
- **tsc-check** (Stop) - TypeScript compilation check (monorepo-friendly)
- **trigger-build-resolver** (Stop) - Auto-launches build-error-resolver agent on build failures
- **error-handling-reminder** (Stop) - Gentle reminders for error handling patterns
- **stop-build-check-enhanced** (Stop) - Enhanced build checking with smart filtering

### Agents (6)

Specialized assistants for complex tasks:

- **code-architecture-reviewer** - Reviews code for adherence to best practices and architectural consistency
- **code-refactor-master** - Refactors code for better organization, cleaner architecture, improved maintainability
- **documentation-architect** - Creates comprehensive documentation from code and memory
- **plan-reviewer** - Reviews development plans for completeness and potential issues
- **refactor-planner** - Analyzes code structure and creates comprehensive refactoring plans
- **web-research-specialist** - Researches technical solutions across GitHub, Stack Overflow, Reddit, forums

### Commands (6)

Slash commands for common workflows:

- **/build-and-fix** - Builds project and automatically fixes errors
- **/code-review** - Conducts comprehensive code review with best practices
- **/dev-docs** - Creates strategic development plans with structured task breakdown
- **/dev-docs-update** - Updates development documentation before context compaction
- **/route-research-for-testing** - Maps edited routes and launches comprehensive tests
- **/test-route** - Tests authenticated API routes with proper auth context

### Skills (1)

- **skill-developer** - Meta-skill for creating and managing Claude Code skills following Anthropic best practices

---

## How It Works

### Auto-Activation System

Skills automatically activate based on:

1. **Prompt Keywords**
   - Example: "create a table component" → shadcn skill activates
   - Example: "query the database" → Prisma skill activates

2. **Intent Patterns** (Regex)
   - Example: "add.*authentication" → relevant auth patterns activate
   - Example: "optimize.*component" → React performance skill activates

3. **File Path Triggers**
   - Editing `app/**/*.tsx` → Next.js skill activates
   - Editing `prisma/schema.prisma` → Prisma skill activates

4. **Content Patterns**
   - File contains `useQuery(` → TanStack Query skill activates
   - File contains `createFileRoute` → TanStack Router skill activates

All configured in `.claude/skills/skill-rules.json` (auto-generated during install).

### What Gets Installed

```
your-project/
└── .claude/
    ├── hooks/                    # Automation scripts
    │   ├── skill-activation-prompt.*
    │   ├── post-tool-use-tracker.sh
    │   └── ... (4 optional hooks)
    ├── agents/                   # Specialized assistants
    │   ├── code-architecture-reviewer.md
    │   ├── refactor-planner.md
    │   └── ... (4 more agents)
    ├── commands/                 # Slash commands
    │   ├── dev-docs.md
    │   ├── build-and-fix.md
    │   └── ... (4 more commands)
    └── skills/                   # Skills + auto-activation
        ├── skill-developer/
        ├── nextjs/              # If installed
        ├── react/               # If installed
        ├── shadcn/              # If installed
        └── skill-rules.json     # Auto-activation config
```

---

## Usage Examples

### Installing for Next.js + shadcn Project

```bash
cd my-nextjs-app
npx github:blencorp/claude-code-kit
```

**Detects:**
- Next.js (from package.json)
- React (from package.json)
- shadcn/ui (from components.json)
- Tailwind CSS (from tailwind.config.ts)

**Prompts:** "Install these detected kits? (Y/n)"

**Result:** Next.js, React, shadcn, and Tailwind skills auto-activate when you:
- Ask: "create a server component with a data table"
- Edit: `app/dashboard/page.tsx`
- Mention: "use shadcn table component"

---

### Installing for Express Backend

```bash
cd my-api
npx github:blencorp/claude-code-kit
```

**Detects:**
- Express (from package.json)
- Node.js (module type)
- Prisma (from prisma/schema.prisma)

**Prompts:** "Install these detected kits? (Y/n)"

**Result:** Express, Node.js, and Prisma skills auto-activate when you:
- Ask: "create an API route for users"
- Edit: `routes/users.ts`
- Mention: "query users from database"

---

### Installing for Full-Stack App

```bash
cd my-fullstack-app
npx github:blencorp/claude-code-kit
```

**Detects both frontend and backend kits automatically**

**Prompts:** Select from detected frameworks

**Result:** Complete coverage of your entire stack

---

### Re-running to Add More Kits

```bash
npx github:blencorp/claude-code-kit
```

**Detects:** Existing installation

**Offers:**
- Update existing kits
- Add new kits
- Keep current setup

---

## Contributing Kits

Want to add support for a new framework? Here's how to create a kit:

### Kit Structure

```
cli/kits/your-framework/
├── kit.json                      # Metadata and detection
├── skills/
│   └── your-framework/
│       ├── SKILL.md             # Main skill file (<500 lines)
│       ├── skill-rules-fragment.json  # Auto-activation triggers
│       └── resources/           # Optional: detailed guides
│           ├── topic-1.md
│           └── topic-2.md
└── agents/                      # Optional: kit-specific agents
    └── your-framework-agent.md
```

### kit.json Format

```json
{
  "name": "your-framework",
  "displayName": "Your Framework",
  "description": "Short description of what this kit provides",
  "detect": "command to detect framework",
  "provides": ["skill:your-framework"]
}
```

**Detection Examples:**
```bash
# Detect from package.json
"detect": "grep -q '\"your-framework\"' package.json"

# Detect from config file
"detect": "test -f your-framework.config.js"

# Detect from directory
"detect": "test -d src/your-framework"
```

### SKILL.md Format

Follow Anthropic best practices:
- Keep main file < 500 lines
- Use YAML frontmatter
- Add table of contents
- Use progressive disclosure (link to resources/)
- Include complete examples

```markdown
---
name: your-framework
displayName: Your Framework
description: Complete description with all keywords for trigger matching (max 1024 chars)
version: 1.0.0
---

# Your Framework Development Guide

Best practices for using Your Framework...

## Table of Contents

- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
...

## Additional Resources

For detailed information, see:
- [Advanced Patterns](resources/advanced-patterns.md)
- [API Reference](resources/api-reference.md)
```

### skill-rules-fragment.json Format

```json
{
  "your-framework": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "high",
    "promptTriggers": {
      "keywords": [
        "your framework",
        "framework name",
        "key concepts"
      ],
      "intentPatterns": [
        "create.*(component|route|feature)",
        "add.*framework.*feature"
      ]
    },
    "fileTriggers": {
      "pathPatterns": [
        "**/your-framework/**/*.ts",
        "**/config.framework.js"
      ],
      "contentPatterns": [
        "import.*from.*your-framework"
      ]
    }
  }
}
```

### Testing Your Kit

1. **Test detection:**
   ```bash
   cd test-project
   bash cli/kits/your-framework/kit.json # run detect command
   ```

2. **Test installation:**
   ```bash
   ./claude-setup
   # Select your kit
   # Verify files copied to .claude/
   ```

3. **Test auto-activation:**
   - Use trigger keywords in prompts
   - Edit files matching pathPatterns
   - Verify skill activates

### Submitting Your Kit

1. Fork the repository
2. Create your kit in `cli/kits/your-framework/`
3. Test thoroughly
4. Update this README's kit catalog
5. Submit pull request with:
   - Kit name and description
   - What it covers
   - Detection mechanism
   - Example usage

---

## Repository Structure

```
claude-code-kit/
├── cli/
│   ├── core/                    # Always installed
│   │   ├── hooks/              # 6 hooks
│   │   ├── agents/             # 6 agents
│   │   ├── commands/           # 6 commands
│   │   └── skills/
│   │       └── skill-developer/  # Meta-skill
│   └── kits/                    # Framework-specific (optional)
│       ├── nextjs/
│       ├── react/
│       ├── shadcn/
│       ├── tailwindcss/
│       ├── mui/
│       ├── tanstack-router/
│       ├── tanstack-query/
│       ├── express/
│       ├── nodejs/
│       └── prisma/
├── claude-setup                 # Installation script
├── package.json
└── README.md
```

**Template vs Installation:**
- `cli/` directory = **Template** (what gets copied)
- User's `.claude/` = **Installation** (what they get)

---

## Updates

Re-run the installer to update or add kits:

```bash
npx github:blencorp/claude-code-kit
```

The installer detects existing installations and offers:
- Update existing kits to latest versions
- Add new kits
- Keep current setup

---

## License

MIT - See [LICENSE](LICENSE) for details.

---

## Credits

Born from solving "skills don't activate automatically" problem.

**The Problem:** Claude Code skills just sat there. You had to remember to use them.

**The Solution:** Auto-activation hooks + framework detection + skill-rules.json = Skills that activate when you need them.

Available as a reference implementation for the community.

---

## Need Help?

- **Installation issues:** Check detection commands in kit.json files
- **Skills not activating:** Check `.claude/skills/skill-rules.json` was generated
- **Framework not detected:** Create an issue or submit a kit!
- **Contributing:** See [Contributing Kits](#contributing-kits) section above
