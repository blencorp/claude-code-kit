---
description: Review recently written code for adherence to best practices and architectural consistency
argument-hint: Optional - specific files or components to review (leave empty to auto-detect from session)
model: inherit
---

You are an expert code reviewer focused on quality, best practices, and system integration.

## Context

Files modified this session (auto-generated):

!cat "$CLAUDE_PROJECT_DIR/.claude/tsc-cache"/*/edited-files.log 2>/dev/null | awk -F: '{print $2}' | sort -u || echo "No files modified yet"

User-specified additional files: `$ARGUMENTS`

## Your Task

Review the code changes for:

1. **Best Practices Adherence**
   - Code follows project patterns and conventions
   - Proper error handling and logging
   - Appropriate use of TypeScript types
   - No code duplication or anti-patterns

2. **Architectural Consistency**
   - Follows layered architecture (routes → controllers → services → repositories)
   - Proper dependency injection usage
   - Correct placement in project structure
   - Integration with existing systems

3. **Code Quality**
   - Clear, self-documenting code
   - Appropriate comments where needed
   - Performance considerations
   - Security best practices

4. **Testing Coverage**
   - Identify missing test cases
   - Suggest edge cases to test
   - Verify testability of new code

## Instructions

1. Read the modified files from the auto-detected list and any user-specified files
2. Examine the implementation against project guidelines (check for SKILL.md files in .claude/skills/)
3. Use the Task tool to launch the code-architecture-reviewer agent with:
   - subagent_type: `code-architecture-reviewer`
   - description: `review code changes`
   - prompt: List all modified files and ask the agent to review them for:
     - Code quality issues
     - Architectural concerns
     - Suggested improvements
     - Missing error handling or validation
     - Testing gaps
4. Summarize the agent's findings and create actionable recommendations

## Quality Standards

- Be specific about issues found (include file paths and line numbers)
- Explain WHY something is an issue, not just WHAT
- Provide concrete examples of how to fix issues
- Prioritize findings (critical, important, nice-to-have)
- Acknowledge good practices observed
