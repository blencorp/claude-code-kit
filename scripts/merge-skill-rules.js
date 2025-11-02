#!/usr/bin/env node

/**
 * Merge skill-rules fragments from all kits into .claude/skill-rules.json
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(REPO_ROOT, '.claude', 'skills', 'skill-rules.json');
const KITS_DIR = path.join(REPO_ROOT, 'cli', 'kits');

function findFragmentFiles() {
  const fragments = [];
  const kits = fs.readdirSync(KITS_DIR);

  for (const kit of kits) {
    const skillsDir = path.join(KITS_DIR, kit, 'skills');
    if (!fs.existsSync(skillsDir)) continue;

    const skills = fs.readdirSync(skillsDir);
    for (const skill of skills) {
      const fragmentPath = path.join(skillsDir, skill, 'skill-rules-fragment.json');
      if (fs.existsSync(fragmentPath)) {
        fragments.push(path.relative(REPO_ROOT, fragmentPath));
      }
    }
  }

  return fragments;
}

function mergeSkillRules() {
  console.log('🔍 Finding skill-rules fragments...');

  const fragmentFiles = findFragmentFiles();

  if (fragmentFiles.length === 0) {
    console.error('❌ No skill-rules fragments found!');
    process.exit(1);
  }

  console.log(`✅ Found ${fragmentFiles.length} fragments`);

  const skills = {};

  for (const fragmentFile of fragmentFiles) {
    const fullPath = path.join(REPO_ROOT, fragmentFile);
    console.log(`   - ${fragmentFile}`);

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const fragment = JSON.parse(content);

      // Merge fragment into skills object
      Object.assign(skills, fragment);
    } catch (error) {
      console.error(`❌ Error reading ${fragmentFile}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n📝 Writing merged skill-rules.json...');

  // Ensure .claude directory exists
  const claudeDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  // Create properly formatted skill-rules.json
  const skillRules = {
    version: "1.0",
    skills: skills
  };

  // Write merged rules
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(skillRules, null, 2) + '\n'
  );

  console.log(`✅ Merged ${Object.keys(skills).length} skill rules to .claude/skills/skill-rules.json`);
  console.log(`\nSkills configured: ${Object.keys(skills).join(', ')}`);
}

if (require.main === module) {
  mergeSkillRules();
}

module.exports = { mergeSkillRules };
