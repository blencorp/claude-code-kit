#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of this script (for ESM compatibility)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface HookInput {
    session_id: string;
    transcript_path: string;
    cwd: string;
    permission_mode: string;
    prompt: string;
}

interface PromptTriggers {
    keywords?: string[];
    intentPatterns?: string[];
}

interface PostToolUseTriggers {
    enabled: boolean;
    tools: string[];
    minEdits: number;
    withinMinutes: number;
    description?: string;
}

interface SkillRule {
    type: 'guardrail' | 'domain';
    enforcement: 'block' | 'suggest' | 'warn';
    priority: 'critical' | 'high' | 'medium' | 'low';
    promptTriggers?: PromptTriggers;
}

interface AgentRule {
    type: 'workflow';
    activation: 'suggest' | 'auto';
    priority: 'critical' | 'high' | 'medium' | 'low';
    promptTriggers?: PromptTriggers;
    postToolUseTriggers?: PostToolUseTriggers;
}

interface SkillRules {
    version: string;
    skills: Record<string, SkillRule>;
    agents?: Record<string, AgentRule>;
}

interface MatchedSkill {
    name: string;
    matchType: 'keyword' | 'intent';
    config: SkillRule;
}

interface MatchedAgent {
    name: string;
    matchType: 'keyword' | 'intent';
    config: AgentRule;
}

async function main() {
    try {
        // Read input from stdin
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);
        const prompt = data.prompt.toLowerCase();

        // Load skill and agent rules
        // Script is at .claude/hooks/, so go up 2 levels to get project root
        const projectDir = process.env.CLAUDE_PROJECT_DIR || join(__dirname, '..', '..');
        const rulesPath = join(projectDir, '.claude', 'skills', 'skill-rules.json');
        const rules: SkillRules = JSON.parse(readFileSync(rulesPath, 'utf-8'));

        const matchedSkills: MatchedSkill[] = [];
        const matchedAgents: MatchedAgent[] = [];

        // Check each skill for matches
        for (const [skillName, config] of Object.entries(rules.skills)) {
            const triggers = config.promptTriggers;
            if (!triggers) {
                continue;
            }

            // Keyword matching (with word boundaries)
            if (triggers.keywords) {
                const keywordMatch = triggers.keywords.some(kw => {
                    // Escape special regex characters in keyword
                    const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
                    return regex.test(prompt);
                });
                if (keywordMatch) {
                    matchedSkills.push({ name: skillName, matchType: 'keyword', config });
                    continue;
                }
            }

            // Intent pattern matching
            if (triggers.intentPatterns) {
                const intentMatch = triggers.intentPatterns.some(pattern => {
                    const regex = new RegExp(pattern, 'i');
                    return regex.test(prompt);
                });
                if (intentMatch) {
                    matchedSkills.push({ name: skillName, matchType: 'intent', config });
                }
            }
        }

        // Check each agent for matches
        if (rules.agents) {
            for (const [agentName, config] of Object.entries(rules.agents)) {
                const triggers = config.promptTriggers;
                if (!triggers) {
                    continue;
                }

                // Keyword matching (with word boundaries)
                if (triggers.keywords) {
                    const keywordMatch = triggers.keywords.some(kw => {
                        // Escape special regex characters in keyword
                        const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
                        return regex.test(prompt);
                    });
                    if (keywordMatch) {
                        matchedAgents.push({ name: agentName, matchType: 'keyword', config });
                        continue;
                    }
                }

                // Intent pattern matching
                if (triggers.intentPatterns) {
                    const intentMatch = triggers.intentPatterns.some(pattern => {
                        const regex = new RegExp(pattern, 'i');
                        return regex.test(prompt);
                    });
                    if (intentMatch) {
                        matchedAgents.push({ name: agentName, matchType: 'intent', config });
                    }
                }
            }
        }

        // Generate output if matches found
        if (matchedSkills.length > 0 || matchedAgents.length > 0) {
            // Group skills by priority
            const criticalSkills = matchedSkills.filter(s => s.config.priority === 'critical');
            const highSkills = matchedSkills.filter(s => s.config.priority === 'high');
            const mediumSkills = matchedSkills.filter(s => s.config.priority === 'medium');
            const lowSkills = matchedSkills.filter(s => s.config.priority === 'low');

            // Group agents by priority
            const criticalAgents = matchedAgents.filter(a => a.config.priority === 'critical');
            const highAgents = matchedAgents.filter(a => a.config.priority === 'high');
            const mediumAgents = matchedAgents.filter(a => a.config.priority === 'medium');
            const lowAgents = matchedAgents.filter(a => a.config.priority === 'low');

            // Determine if we have critical/high priority items that MUST be activated
            const mustActivateSkills = [...criticalSkills, ...highSkills];
            const mustActivateAgents = [...criticalAgents, ...highAgents];
            const suggestedSkills = [...mediumSkills, ...lowSkills];
            const suggestedAgents = [...mediumAgents, ...lowAgents];

            let contextParts: string[] = [];

            // REQUIRED activations (critical + high priority)
            if (mustActivateSkills.length > 0 || mustActivateAgents.length > 0) {
                contextParts.push('REQUIRED: Before responding to this prompt, you MUST take the following actions:');
                contextParts.push('');

                if (mustActivateSkills.length > 0) {
                    const skillName = mustActivateSkills[0].name;
                    const otherSkills = mustActivateSkills.slice(1).map(s => s.name);
                    contextParts.push(`1. Invoke the Skill tool with skill="${skillName}"`);
                    contextParts.push('   This skill contains critical guidelines for handling this request.');
                    if (otherSkills.length > 0) {
                        contextParts.push(`   Also consider: ${otherSkills.join(', ')}`);
                    }
                    contextParts.push('');
                }

                if (mustActivateAgents.length > 0) {
                    const agentName = mustActivateAgents[0].name;
                    const step = mustActivateSkills.length > 0 ? '2' : '1';
                    contextParts.push(`${step}. Use the Task tool with subagent_type="${agentName}"`);
                    contextParts.push('   This agent is specialized for the task at hand.');
                    contextParts.push('');
                }

                contextParts.push('Do NOT skip these steps. They ensure quality and consistency.');
            }

            // SUGGESTED activations (medium + low priority)
            if (suggestedSkills.length > 0 || suggestedAgents.length > 0) {
                if (mustActivateSkills.length > 0 || mustActivateAgents.length > 0) {
                    contextParts.push('');
                    contextParts.push('ADDITIONAL SUGGESTIONS:');
                } else {
                    contextParts.push('SUGGESTED: Consider using these tools for better results:');
                    contextParts.push('');
                }

                if (suggestedSkills.length > 0) {
                    contextParts.push(`- Skills: ${suggestedSkills.map(s => s.name).join(', ')}`);
                }
                if (suggestedAgents.length > 0) {
                    contextParts.push(`- Agents: ${suggestedAgents.map(a => a.name).join(', ')}`);
                }
            }

            // Output in official JSON format for UserPromptSubmit hooks
            const hookOutput = {
                hookSpecificOutput: {
                    hookEventName: 'UserPromptSubmit',
                    additionalContext: contextParts.join('\n')
                }
            };

            console.log(JSON.stringify(hookOutput));
        }

        process.exit(0);
    } catch (err) {
        console.error('Error in skill-activation-prompt hook:', err);
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Uncaught error:', err);
    process.exit(1);
});
