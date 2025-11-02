# Claude Code CLI - Architecture & Design

> **⚠️ IMPORTANT:** This document describes a **future TypeScript CLI implementation**. The current working implementation uses a bash script (`claude-setup`) with a **kit-based architecture**.

## Current Implementation (v0.2.0)

**What exists now:**
- Bash script: `claude-setup` (bash-based installer)
- Architecture: **Kits** (not plugins)
- Location: `cli/kits/` directory
- Auto-detection via `kit.json` files

**Kit vs Skill (Current Model):**
- **Kit** = Distribution package (contains skills + detection logic)
- **Skill** = Knowledge document Claude reads (SKILL.md + resources/)
- Kits live in `cli/kits/`, skills get installed to `.claude/skills/`
- See [README.md Key Concepts](README.md#kits-vs-skills---understanding-the-architecture) for details

---

## Future Vision: TypeScript CLI with Plugin System

Below is the **planned architecture** for a future TypeScript-based CLI tool that will replace the bash script with a more robust plugin system.

### Overview

A CLI tool to initialize and manage Claude Code infrastructure (skills, hooks, agents, commands) with framework-specific plugin support.

## Project Structure

```
claude-code-cli/
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
│
├── src/
│   ├── index.ts                    # CLI entry point (commander setup)
│   ├── commands/
│   │   ├── init.ts                 # Initialize .claude directory
│   │   ├── add.ts                  # Add components (skills, agents, etc.)
│   │   ├── plugin.ts               # Plugin management
│   │   └── update.ts               # Update configurations
│   │
│   ├── core/
│   │   ├── plugin-manager.ts       # Load, validate, install plugins
│   │   ├── template-engine.ts      # Path substitution, file templating
│   │   ├── merger.ts               # Merge skill-rules fragments
│   │   ├── installer.ts            # Copy files, create directories
│   │   └── detector.ts             # Auto-detect project structure
│   │
│   ├── utils/
│   │   ├── logger.ts               # Colored console output
│   │   ├── prompts.ts              # Interactive prompts (inquirer)
│   │   ├── validators.ts           # Path, name, version validation
│   │   └── git.ts                  # Git operations helper
│   │
│   └── types/
│       ├── plugin.ts               # Plugin manifest types
│       ├── config.ts               # CLI config types
│       └── index.ts                # Type exports
│
├── core/                           # Framework-agnostic infrastructure
│   ├── hooks/
│   │   ├── skill-activation-prompt.sh
│   │   ├── skill-activation-prompt.ts
│   │   ├── post-tool-use-tracker.sh
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── skills/
│   │   └── skill-developer/
│   │       ├── SKILL.md
│   │       └── [7 resource files]
│   │
│   ├── agents/
│   │   ├── code-architecture-reviewer.md
│   │   ├── code-refactor-master.md
│   │   ├── documentation-architect.md
│   │   ├── plan-reviewer.md
│   │   ├── refactor-planner.md
│   │   ├── web-research-specialist.md
│   │   └── README.md
│   │
│   ├── commands/
│   │   ├── dev-docs.md
│   │   ├── dev-docs-update.md
│   │   └── README.md
│   │
│   └── templates/
│       ├── settings.json.template
│       ├── settings.local.json.template
│       └── skill-rules.json.template
│
├── plugins/                        # Framework-specific plugins
│   ├── react-mui/
│   │   ├── plugin.json
│   │   ├── README.md
│   │   ├── skills/
│   │   │   ├── frontend-dev-guidelines/
│   │   │   │   ├── SKILL.md
│   │   │   │   └── resources/ (11 files)
│   │   │   └── skill-rules.fragment.json
│   │   └── agents/
│   │       └── frontend-error-fixer.md
│   │
│   ├── nextjs/
│   │   ├── plugin.json
│   │   ├── README.md
│   │   ├── skills/
│   │   │   ├── nextjs-dev-guidelines/
│   │   │   └── skill-rules.fragment.json
│   │   └── agents/
│   │       └── nextjs-error-fixer.md
│   │
│   ├── express/
│   │   ├── plugin.json
│   │   ├── README.md
│   │   ├── skills/
│   │   │   ├── backend-dev-guidelines/
│   │   │   │   ├── SKILL.md
│   │   │   │   └── resources/ (12 files)
│   │   │   └── skill-rules.fragment.json
│   │   └── agents/
│   │       ├── auth-route-tester.md
│   │       └── auth-route-debugger.md
│   │
│   ├── sentry/
│   │   ├── plugin.json
│   │   ├── skills/
│   │   │   ├── error-tracking/
│   │   │   └── skill-rules.fragment.json
│   │   └── README.md
│   │
│   └── shadcn/
│       ├── plugin.json
│       ├── skills/
│       │   ├── shadcn-dev-guidelines/
│       │   └── skill-rules.fragment.json
│       └── README.md
│
├── examples/                       # Example projects
│   ├── react-app/
│   ├── nextjs-app/
│   └── express-api/
│
└── docs/
    ├── commands.md                 # CLI command reference
    ├── plugin-development.md       # How to create plugins
    ├── configuration.md            # Configuration options
    └── migration.md                # Migrate existing projects

```

---

## CLI Commands

### `init` - Initialize Claude Code infrastructure

```bash
# Interactive mode (recommended)
claude-code-cli init

# With flags
claude-code-cli init --frontend react-mui --backend express --sentry
claude-code-cli init --frontend nextjs
claude-code-cli init --preset fullstack-react
```

**Workflow:**
1. Detect existing `.claude/` directory (warn if exists)
2. Interactive prompts:
   - Project type (frontend, backend, fullstack, monorepo)
   - Frontend framework (react-mui, nextjs, vue, svelte, none)
   - Backend framework (express, fastify, nextjs-api, none)
   - Additional tools (sentry, prisma, etc.)
   - Project structure (monorepo? paths?)
3. Install selected plugins
4. Copy core infrastructure (hooks, skill-developer)
5. Merge skill-rules.json fragments
6. Customize paths in templates
7. Create settings.json
8. Install hook dependencies (`npm install` in .claude/hooks/)
9. Success message with next steps

### `add` - Add individual components

```bash
# Add specific components
claude-code-cli add skill frontend-dev-guidelines
claude-code-cli add agent code-architecture-reviewer
claude-code-cli add command dev-docs
claude-code-cli add hook tsc-check

# Add from plugin
claude-code-cli add --plugin react-mui

# Interactive mode
claude-code-cli add
```

### `plugin` - Manage plugins

```bash
# List available plugins
claude-code-cli plugin list
claude-code-cli plugin list --installed

# Install plugin
claude-code-cli plugin install react-mui
claude-code-cli plugin install nextjs shadcn

# Uninstall plugin
claude-code-cli plugin uninstall react-mui

# Create new plugin scaffold
claude-code-cli plugin create my-framework

# Validate plugin
claude-code-cli plugin validate ./plugins/my-plugin
```

### `update` - Update configurations

```bash
# Update path patterns in skill-rules.json
claude-code-cli update paths

# Auto-detect and update
claude-code-cli update --detect

# Update to latest versions
claude-code-cli update --upgrade
```

---

## Plugin System

### Plugin Manifest (`plugin.json`)

```json
{
  "name": "react-mui",
  "version": "1.0.0",
  "displayName": "React + Material-UI Plugin",
  "description": "Claude Code skills and agents for React 18+ with Material-UI v7",
  "author": "Your Name <email@example.com>",
  "homepage": "https://github.com/user/repo",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo"
  },
  "keywords": ["react", "mui", "material-ui", "frontend"],

  "compatibility": {
    "claudeCode": ">=1.0.0",
    "node": ">=18.0.0"
  },

  "provides": {
    "skills": [
      "frontend-dev-guidelines"
    ],
    "agents": [
      "frontend-error-fixer"
    ],
    "commands": [],
    "hooks": [],
    "skillRulesFragment": "skills/skill-rules.fragment.json"
  },

  "dependencies": {
    "plugins": [],
    "npm": {
      "@types/react": "^18.0.0",
      "react": "^18.0.0",
      "@mui/material": "^7.0.0"
    }
  },

  "pathPatterns": {
    "frontend": [
      "frontend/src/**/*.tsx",
      "frontend/src/**/*.ts",
      "client/src/**/*.tsx",
      "src/**/*.tsx",
      "app/**/*.tsx",
      "pages/**/*.tsx"
    ]
  },

  "contentPatterns": {
    "react": [
      "from 'react'",
      "import React",
      "export default function",
      "React\\.FC<"
    ],
    "mui": [
      "from '@mui/material'",
      "<Grid ",
      "sx={{",
      "useTheme()"
    ]
  },

  "templates": {
    "paths": {
      "FRONTEND_SRC": "src",
      "COMPONENTS_DIR": "src/components",
      "FEATURES_DIR": "src/features"
    }
  },

  "prompts": [
    {
      "type": "input",
      "name": "frontendDir",
      "message": "Frontend source directory",
      "default": "src"
    },
    {
      "type": "confirm",
      "name": "useTanStackQuery",
      "message": "Using TanStack Query?",
      "default": true
    }
  ]
}
```

### Skill Rules Fragment (`skill-rules.fragment.json`)

```json
{
  "skills": {
    "frontend-dev-guidelines": {
      "type": "guardrail",
      "enforcement": "block",
      "priority": "critical",
      "promptTriggers": {
        "keywords": [
          "component",
          "react",
          "mui",
          "material-ui",
          "frontend",
          "client",
          "tsx",
          "jsx"
        ],
        "intentPatterns": [
          "(create|add|build|implement).*(component|page|feature|ui)",
          "(style|design|layout).*(component|page)",
          "(react|frontend|client).*(code|development|work)"
        ]
      },
      "fileTriggers": {
        "pathPatterns": [
          "{{FRONTEND_DIR}}/**/*.tsx",
          "{{FRONTEND_DIR}}/**/*.ts"
        ],
        "contentPatterns": [
          "from '@mui/material'",
          "from 'react'",
          "<Grid ",
          "useSuspenseQuery"
        ]
      }
    }
  }
}
```

---

## Template Engine

### Variable Substitution

**Syntax:** `{{VARIABLE_NAME}}`

**Built-in variables:**
- `{{PROJECT_ROOT}}` - Project root directory
- `{{CLAUDE_DIR}}` - .claude directory path
- `{{PROJECT_NAME}}` - Detected project name

**Plugin-defined variables:**
- From `plugin.json` → `templates.paths`
- From user prompts (interactive mode)

**Example:**
```json
// Before (template)
"pathPatterns": [
  "{{FRONTEND_DIR}}/src/**/*.tsx",
  "{{BACKEND_DIR}}/src/**/*.ts"
]

// After (with FRONTEND_DIR=frontend, BACKEND_DIR=api)
"pathPatterns": [
  "frontend/src/**/*.tsx",
  "api/src/**/*.ts"
]
```

### Merging Strategy

**skill-rules.json merging:**
1. Start with base template (`core/templates/skill-rules.json.template`)
2. For each installed plugin:
   - Load `skill-rules.fragment.json`
   - Apply variable substitution
   - Deep merge into main skill-rules.json
   - Preserve existing skills (no overwrite)
3. Write final skill-rules.json

**settings.json merging:**
1. Start with base template
2. Add hooks from core (skill-activation-prompt, post-tool-use-tracker)
3. Add hooks from plugins (if provided)
4. Merge permissions
5. Write settings.json

---

## Project Detection

### Auto-detection logic

```typescript
interface DetectedProject {
  type: 'frontend' | 'backend' | 'fullstack' | 'monorepo';
  frontend?: {
    framework: 'react' | 'nextjs' | 'vue' | 'svelte' | null;
    directory: string;
    hasTypeScript: boolean;
    hasMUI: boolean;
    hasShadcn: boolean;
  };
  backend?: {
    framework: 'express' | 'fastify' | 'nextjs-api' | null;
    directory: string;
    hasTypeScript: boolean;
    hasPrisma: boolean;
    hasSentry: boolean;
  };
  monorepo?: {
    tool: 'turborepo' | 'nx' | 'lerna' | 'pnpm-workspaces' | null;
    packages: string[];
  };
}
```

**Detection methods:**
1. Check `package.json` dependencies
2. Scan directory structure (src/, app/, pages/, api/)
3. Check for framework config files (next.config.js, vite.config.ts)
4. Look for monorepo indicators (turbo.json, nx.json, pnpm-workspace.yaml)

---

## Installation Flow

### Example: `claude-code-cli init`

```
┌─────────────────────────────────────────────────┐
│  Claude Code CLI - Initialize Infrastructure    │
└─────────────────────────────────────────────────┘

✓ Detected project structure:
  - Type: Fullstack
  - Frontend: React + TypeScript (src/)
  - Backend: Express + TypeScript (api/)

? Select frontend framework: (Use arrow keys)
❯ react-mui (Detected: React + MUI dependencies)
  nextjs
  vue
  svelte
  none

? Select backend framework:
❯ express (Detected: Express in dependencies)
  fastify
  nextjs-api
  none

? Additional tools: (Press space to select)
◉ sentry (Detected in dependencies)
◯ prisma (Detected in dependencies)

? Frontend source directory: (src)
? Backend source directory: (api)

Installing infrastructure...

✓ Copied core hooks (2 files)
✓ Installed skill-developer
✓ Installed react-mui plugin
  - frontend-dev-guidelines skill
  - frontend-error-fixer agent
✓ Installed express plugin
  - backend-dev-guidelines skill
  - auth-route-tester agent
  - auth-route-debugger agent
✓ Installed sentry plugin
  - error-tracking skill
✓ Merged skill-rules.json (4 skills)
✓ Created settings.json
✓ Installed hook dependencies

┌─────────────────────────────────────────────────┐
│  Setup Complete! 🎉                              │
└─────────────────────────────────────────────────┘

Next steps:

1. Review configuration:
   .claude/settings.json
   .claude/skills/skill-rules.json

2. Test skill activation:
   - Edit a React component
   - Ask Claude "How do I create a new component?"
   - Skills should auto-activate!

3. Optional: Add more components
   claude-code-cli add agent code-architecture-reviewer
   claude-code-cli add command dev-docs

Documentation: https://github.com/...
```

---

## Configuration Files

### CLI Config (`.claude-code-cli.json`)

Stored in project root to remember installed plugins and settings.

```json
{
  "version": "1.0.0",
  "installedAt": "2025-11-01T00:00:00.000Z",
  "plugins": [
    {
      "name": "react-mui",
      "version": "1.0.0",
      "installedAt": "2025-11-01T00:00:00.000Z"
    },
    {
      "name": "express",
      "version": "1.0.0",
      "installedAt": "2025-11-01T00:00:00.000Z"
    }
  ],
  "customPaths": {
    "FRONTEND_DIR": "src",
    "BACKEND_DIR": "api"
  }
}
```

---

## Package.json

```json
{
  "name": "@claude-code/cli",
  "version": "1.0.0",
  "description": "CLI to initialize and manage Claude Code infrastructure with framework plugins",
  "bin": {
    "claude-code-cli": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "prepare": "npm run build"
  },
  "dependencies": {
    "commander": "^11.0.0",
    "inquirer": "^9.0.0",
    "chalk": "^5.0.0",
    "ora": "^7.0.0",
    "fs-extra": "^11.0.0",
    "glob": "^10.0.0",
    "ajv": "^8.0.0",
    "handlebars": "^4.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/inquirer": "^9.0.0",
    "@types/fs-extra": "^11.0.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "eslint": "^8.0.0"
  },
  "keywords": [
    "claude-code",
    "ai",
    "cli",
    "code-assistant",
    "skills",
    "hooks"
  ]
}
```

---

## Technology Stack

- **Language:** TypeScript (strict mode)
- **CLI Framework:** Commander.js
- **Interactive Prompts:** Inquirer.js
- **File Operations:** fs-extra
- **Templating:** Handlebars
- **Validation:** Ajv (JSON Schema)
- **UI:** chalk (colors), ora (spinners)
- **Testing:** Jest
- **Build:** TSC

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- ✅ Project setup (package.json, tsconfig, tooling)
- ✅ Plugin manifest schema + validation
- ✅ Plugin manager (load, validate)
- ✅ Template engine (variable substitution)
- ✅ Merger (skill-rules.json, settings.json)

### Phase 2: Init Command (Week 2)
- ✅ Project detector
- ✅ Interactive prompts
- ✅ File installer
- ✅ Core infrastructure copying
- ✅ Plugin installation
- ✅ End-to-end init workflow

### Phase 3: Plugin Development (Week 3)
- ✅ Extract react-mui plugin
- ✅ Extract express plugin
- ✅ Extract sentry plugin
- ✅ Create nextjs plugin
- ✅ Create shadcn plugin

### Phase 4: Additional Commands (Week 4)
- ✅ `add` command
- ✅ `plugin list/install/create` commands
- ✅ `update` command

### Phase 5: Testing & Documentation (Week 5)
- ✅ Unit tests for core modules
- ✅ Integration tests for commands
- ✅ Example projects
- ✅ Complete documentation
- ✅ Publish to npm

---

## Distribution

### NPM Package

```bash
npm install -g @claude-code/cli
```

### GitHub Repository

```
https://github.com/your-org/claude-code-cli
```

**Repository includes:**
- CLI source code
- Built-in plugins (react-mui, nextjs, express, etc.)
- Core infrastructure
- Documentation
- Example projects

### Plugin Marketplace

Future: Separate repo for community plugins

```
https://github.com/your-org/claude-code-plugins
```

---

## Open Questions

1. **Plugin versioning:** How to handle plugin updates? Semantic versioning?
2. **Plugin conflicts:** What if two plugins define same skill with different configs?
3. **Custom plugin repos:** Support installing from GitHub URLs?
4. **Update strategy:** How to update existing installations without overwriting customizations?
5. **Monorepo support:** How to handle multiple .claude directories?

---

## Next Steps

1. Set up CLI project with TypeScript + Commander
2. Implement plugin manifest schema with Ajv validation
3. Build plugin manager (load, validate, install)
4. Create template engine with variable substitution
5. Implement merger for skill-rules.json
6. Build init command with interactive prompts
7. Extract first plugin (react-mui)
8. Test end-to-end workflow
