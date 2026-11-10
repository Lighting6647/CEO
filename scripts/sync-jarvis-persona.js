import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ceoRoot = path.resolve(__dirname, '..');

const sourceGeminiMd = path.join(ceoRoot, 'GEMINI.md');
const sourceAgentsMd = path.join(ceoRoot, 'AGENTS.md');
const sourceRuleMd = path.join(ceoRoot, '.agent', 'rules', 'jarvis-core-persona.md');
const sourceAntiSlopMd = path.join(ceoRoot, '.agent', 'rules', 'anti-ai-slop-production-rules.md');
const sourceTeamWorkflowMd = path.join(ceoRoot, '.agent', 'rules', 'agent-team-workflow.md');

const candidateRoots = ['D:\\AI\\Light', 'D:\\Light'];
let syncedProjects = 0;

for (const rootDir of candidateRoots) {
  if (!fs.existsSync(rootDir)) continue;

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const projectPath = path.join(rootDir, entry.name);

    // Skip CEO itself as it is the master source
    if (path.resolve(projectPath).toLowerCase() === ceoRoot.toLowerCase()) {
      continue;
    }

    try {
      // 1. Copy GEMINI.md and AGENTS.md to root of sibling project
      fs.copyFileSync(sourceGeminiMd, path.join(projectPath, 'GEMINI.md'));
      fs.copyFileSync(sourceAgentsMd, path.join(projectPath, 'AGENTS.md'));

      // 2. Ensure .agent/rules and .agents/rules exist and sync rules
      for (const agentFolder of ['.agent', '.agents']) {
        const rulesDir = path.join(projectPath, agentFolder, 'rules');
        fs.mkdirSync(rulesDir, { recursive: true });
        fs.copyFileSync(sourceRuleMd, path.join(rulesDir, 'jarvis-core-persona.md'));
        if (fs.existsSync(sourceAntiSlopMd)) {
          fs.copyFileSync(sourceAntiSlopMd, path.join(rulesDir, 'anti-ai-slop-production-rules.md'));
        }
        if (fs.existsSync(sourceTeamWorkflowMd)) {
          fs.copyFileSync(sourceTeamWorkflowMd, path.join(rulesDir, 'agent-team-workflow.md'));
        }
      }

      console.log(`✅ [Synced] ${projectPath}`);
      syncedProjects++;
    } catch (err) {
      console.warn(`⚠️ [Skipped] ${projectPath}: ${err.message}`);
    }
  }
}

console.log(`🎉 ซิงค์ตัวตน "จาวิส" และกฎเหล็ก 5 ประการสำเร็จทั้งหมด ${syncedProjects} โปรเจกต์`);
