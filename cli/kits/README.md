# Claude Code Kits - Developer Guide

## What is a Kit?

A **kit** is a distribution package for a specific technology/framework. It bundles everything needed to add Claude Code support for that technology.

### Kit vs Skill

| Concept | Purpose | Location | Used By |
|---------|---------|----------|---------|
| **Kit** | Distribution/installation unit | `cli/kits/react/` | `claude-setup` installer |
| **Skill** | Domain knowledge document | `.claude/skills/react/` | Claude during sessions |

**Think of it this way:**
- **Kit** = The box you ship
- **Skill** = The content Claude reads

## Kit Structure

```
cli/kits/react/
├── kit.json                      # Metadata + auto-detection
├── skills/                       # One or more skills
│   └── react/
│       ├── SKILL.md             # Main skill file (<500 lines)
│       └── resources/           # Progressive disclosure content
│           ├── component-patterns.md
│           ├── performance.md
│           └── ...
├── agents/                       # Optional: specialized agents
│   └── frontend-error-fixer.md
├── commands/                     # Optional: slash commands
│   └── test-component.md
└── skill-rules.fragment.json    # Skill activation triggers
```

## Core Files Explained

### kit.json

Metadata and auto-detection logic:

```json
{
  "name": "react",
  "displayName": "React",
  "description": "React 18+ patterns and best practices",
  "version": "1.0.0",
  "detect": {
    "command": "grep -q '\"react\"' package.json 2>/dev/null"
  }
}
```

**Fields:**
- `name`: Kit identifier (must match directory name)
- `displayName`: Human-readable name shown during setup
- `description`: Brief description
- `detect.command`: Bash command that returns 0 if framework detected

**Detection Examples:**
```json
// React detection
"command": "grep -q '\"react\"' package.json 2>/dev/null"

// Express detection
"command": "grep -qE '\"express\"|\"@types/express\"' package.json 2>/dev/null"

// Prisma detection
"command": "[ -f prisma/schema.prisma ]"

// Multiple conditions
"command": "grep -q '\"react\"' package.json && [ -d src ]"
```

### skill-rules.fragment.json

Defines when the skill should activate:

```json
{
  "skills": {
    "react": {
      "type": "domain",
      "enforcement": "suggest",
      "priority": "high",
      "promptTriggers": {
        "keywords": ["react", "component", "jsx", "tsx", "hooks"],
        "intentPatterns": [
          "(create|build).*(component|page)",
          "react.*(development|pattern)"
        ]
      },
      "fileTriggers": {
        "pathPatterns": [
          "**/*.tsx",
          "**/*.jsx",
          "src/components/**/*.ts"
        ],
        "contentPatterns": [
          "from 'react'",
          "import React",
          "React.FC<"
        ]
      }
    }
  }
}
```

**How it works:**
1. User edits a `.tsx` file → `pathPatterns` match → skill activates
2. User asks "How do I create a component?" → `keywords` match → skill activates
3. File contains `import React` → `contentPatterns` match → skill activates

**Trigger Types:**
- `promptTriggers.keywords`: Simple word matching in user prompts
- `promptTriggers.intentPatterns`: Regex patterns for intent matching
- `fileTriggers.pathPatterns`: Glob patterns for file paths
- `fileTriggers.contentPatterns`: Regex patterns for file content

**Enforcement Levels:**
- `suggest`: Suggest skill activation (default)
- `block`: Block without skill (use for critical guardrails)
- `warn`: Warn if skill not activated

## Installation Flow

When user runs `npx claude-code-setup`:

```
1. Detect frameworks
   └─> Run kit.json detect command for each kit

2. User selects kits to install
   └─> Interactive prompts or --yes flag

3. For each selected kit:
   ├─> Copy skills/ → .claude/skills/
   ├─> Copy agents/ → .claude/agents/ (if exists)
   ├─> Copy commands/ → .claude/commands/ (if exists)
   └─> Merge skill-rules.fragment.json → .claude/skills/skill-rules.json

4. Create settings.json
   └─> Configure hooks to activate skills

5. Install hook dependencies
   └─> npm install in .claude/hooks/
```

## Creating a New Kit

### Step 1: Create Directory Structure

```bash
mkdir -p cli/kits/myframework/{skills/myframework/resources,agents,commands}
```

### Step 2: Create kit.json

```json
{
  "name": "myframework",
  "displayName": "My Framework",
  "description": "Patterns for My Framework",
  "version": "1.0.0",
  "detect": {
    "command": "grep -q '\"myframework\"' package.json 2>/dev/null"
  }
}
```

### Step 3: Create Skill

**cli/kits/myframework/skills/myframework/SKILL.md:**

```markdown
---
name: myframework
displayName: My Framework
description: Development guidelines for My Framework
---

# My Framework Development Guidelines

## Core Concepts

[Your framework's key concepts...]

## Common Patterns

[Your framework's patterns...]

## Additional Resources

For detailed information, see:
- [Advanced Patterns](resources/advanced-patterns.md)
- [Best Practices](resources/best-practices.md)
```

**Important:**
- Must be under 500 lines
- Use progressive disclosure (move details to resources/)
- Reference resources that actually exist

### Step 4: Create Resources

**cli/kits/myframework/skills/myframework/resources/advanced-patterns.md:**

```markdown
# Advanced Patterns

[Detailed content here, <500 lines per file...]
```

### Step 5: Create Skill Rules Fragment

**cli/kits/myframework/skill-rules.fragment.json:**

```json
{
  "skills": {
    "myframework": {
      "type": "domain",
      "enforcement": "suggest",
      "priority": "high",
      "promptTriggers": {
        "keywords": ["myframework", "key", "terms"],
        "intentPatterns": [
          "myframework.*(pattern|development)"
        ]
      },
      "fileTriggers": {
        "pathPatterns": [
          "**/*.myext"
        ],
        "contentPatterns": [
          "from 'myframework'"
        ]
      }
    }
  }
}
```

### Step 6: Test Detection

```bash
cd /path/to/test-project
../claude-code-infrastructure-showcase/claude-setup
# Should detect your framework if conditions match
```

## Best Practices

### Kit Design

1. **One Technology Per Kit**
   - ✅ Good: `react` kit for React
   - ❌ Bad: `frontend` kit for React + Vue + Angular

2. **Clear Detection Logic**
   - ✅ Good: Check for specific package in package.json
   - ❌ Bad: Vague directory checks that might false positive

3. **Focused Skills**
   - ✅ Good: One skill per framework
   - ⚠️ Acceptable: Related skills (e.g., tanstack-query + tanstack-router)

### Skill Content

1. **Follow 500-Line Rule**
   - Main SKILL.md must be <500 lines
   - Each resource file must be <500 lines
   - Use progressive disclosure for deep topics

2. **Use Real Examples**
   - Show actual code patterns
   - Use generic domain (blog/posts/users)
   - Avoid product-specific examples

3. **Reference Resources Correctly**
   - Every resource link in SKILL.md must exist
   - Use relative paths: `[Advanced](resources/advanced.md)`

### Skill Rules

1. **Specific Triggers**
   - ✅ Good: `["react", "component", "jsx"]`
   - ❌ Bad: `["code", "development", "programming"]`

2. **Useful Path Patterns**
   - ✅ Good: `**/*.tsx`, `src/components/**/*.ts`
   - ❌ Bad: `**/*` (too broad)

3. **Relevant Content Patterns**
   - ✅ Good: `from 'react'`, `import React`
   - ❌ Bad: `function`, `const` (too generic)

## Available Kits

| Kit | Skill | Detection | Resources |
|-----|-------|-----------|-----------|
| react | react | "react" in package.json | 4 files |
| mui | mui | "@mui/material" in package.json | 3 files |
| nodejs | nodejs | "typescript" + certain patterns | 3 files |
| express | express | "express" in package.json | 0 files |
| prisma | prisma | prisma/schema.prisma exists | 0 files |
| tanstack-query | tanstack-query | "@tanstack/react-query" | 3 files |
| tanstack-router | tanstack-router | "@tanstack/react-router" | 3 files |

## Troubleshooting

### Kit Not Detected

1. Check detection command:
   ```bash
   cd /path/to/project
   eval "grep -q '\"react\"' package.json 2>/dev/null"
   echo $?  # Should be 0 if detected
   ```

2. Verify kit.json syntax:
   ```bash
   jq . cli/kits/mykit/kit.json
   ```

### Skill Not Activating

1. Check skill-rules.json was merged:
   ```bash
   jq '.skills.myframework' .claude/skills/skill-rules.json
   ```

2. Test trigger patterns manually:
   ```bash
   # Should output skill name if pattern matches
   cat .claude/skills/skill-rules.json | jq -r '.skills | keys[]'
   ```

### Resources Not Found

1. Verify resources exist:
   ```bash
   ls -la cli/kits/mykit/skills/mykit/resources/
   ```

2. Check SKILL.md references match filenames exactly

## Contributing Kits

When contributing a new kit:

1. Follow the structure above
2. Test detection on multiple project types
3. Verify skill activates correctly
4. Ensure all resource links work
5. Run the installer in a test project
6. Document any special setup requirements

## Next Steps

- See [skill-developer](.claude/skills/skill-developer/) for skill authoring guide
- See [README.md](../../README.md) for overall architecture
- See [CLI_ARCHITECTURE.md](../../CLI_ARCHITECTURE.md) for future plugin system design
