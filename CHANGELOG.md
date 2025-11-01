# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-01

### Added
- Initial release of `claude-code-setup` automated installer
- Bash script that copies Claude Code infrastructure to your project
- Auto-detection for React, Express, and fullstack projects
- Interactive plugin selection prompts
- Support for `--yes` flag (auto-detect, no prompts)
- Support for `--force` flag (overwrite existing .claude)
- Support for `--help` flag
- Core infrastructure installation:
  - Essential hooks (skill-activation-prompt, post-tool-use-tracker)
  - skill-developer meta-skill
  - 6 framework-agnostic agents
  - 2 slash commands (dev-docs)
- Plugin system:
  - react-mui plugin (React 18+ with MUI v7)
  - express plugin (Express.js with TypeScript)
- Automatic skill-rules.json generation with detected paths
- Automatic settings.json creation with hook configuration
- Automatic .gitignore updates
- Hook dependency installation (npm install in .claude/hooks)
- Installation verification
- npm package distribution (installable via `npx claude-code-setup`)

### Technical Details
- 300 lines of bash (vs 18,000 lines of TypeScript that didn't run)
- Uses jq for JSON manipulation (graceful fallback if not available)
- Handles symlinks correctly for global npm installation
- Zero dependencies (bash + standard unix tools)
- Tested on React, Express, and fullstack projects
- Package size: 134 kB (64 files)

## Unreleased

### Planned for 0.2.0
- Path customization flags (--frontend-dir, --backend-dir)
- Next.js plugin
- Vue.js plugin
- Svelte plugin
- Sentry plugin
- Prisma plugin
- Windows support (if requested)
- Interactive path prompts (if requested)

[0.1.0]: https://github.com/blencorp/claude-code-infrastructure-showcase/releases/tag/v0.1.0
