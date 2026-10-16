import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const gitHooksDir = path.join(rootDir, '.git', 'hooks');

console.log('🛡️ Setting up Antigravity Production Quality Git Hooks...');

if (!fs.existsSync(gitHooksDir)) {
  fs.mkdirSync(gitHooksDir, { recursive: true });
}

// 1. Pre-Commit Hook (Linter, Secrets check, Large files check)
const preCommitScript = `#!/usr/bin/env sh
echo "🔍 [Antigravity Gate 1 & 3] Running Pre-Commit Quality Checks..."

# Check 1: Prevent committing sensitive files or large media
BANNED_PATTERNS="(\\.env$|\\.db$|\\.mp3$|\\.mp4$|credentials|secret_key|id_rsa)"
COMMITTED_FILES=$(git diff --cached --name-only)

for file in $COMMITTED_FILES; do
  if echo "$file" | grep -Eqi "$BANNED_PATTERNS"; then
    echo "❌ [SECURITY REJECTED] File '$file' matches banned sensitive/large media patterns."
    echo "💡 Please remove it from staging or add it to .gitignore."
    exit 1
  fi
done

# Check 2: Run Linter if available
if npm run | grep -q "lint"; then
  echo "⚡ Running Linter (oxlint / eslint)..."
  npm run lint
  if [ $? -ne 0 ]; then
    echo "❌ [LINT FAILED] Code has linter errors. Fix before committing."
    exit 1
  fi
fi

echo "✅ [Pre-Commit Passed] All quality gates cleared."
exit 0
`;

// 2. Pre-Push Hook (Build & Autonomous Test Checks)
const prePushScript = `#!/usr/bin/env sh
echo "🛡️ [Antigravity Gate 2 & 3] Running Pre-Push Verification Pipeline..."

# Check 1: Test Suite execution
if npm run | grep -q "test"; then
  echo "🧪 Running Automated Tests..."
  npm test
  if [ $? -ne 0 ]; then
    echo "❌ [TEST FAILED] Tests must pass 100% before pushing to remote."
    exit 1
  fi
fi

# Check 2: Production Build Check
if npm run | grep -q "build"; then
  echo "🏗️ Checking Production Build (npm run build)..."
  npm run build
  if [ $? -ne 0 ]; then
    echo "❌ [BUILD FAILED] Production build failed. Push aborted."
    exit 1
  fi
fi

echo "✅ [Pre-Push Passed] Safe to push to remote repository."
exit 0
`;

const preCommitPath = path.join(gitHooksDir, 'pre-commit');
const prePushPath = path.join(gitHooksDir, 'pre-push');

fs.writeFileSync(preCommitPath, preCommitScript, { mode: 0o755 });
fs.writeFileSync(prePushPath, prePushScript, { mode: 0o755 });

console.log('✅ Git Hooks installed successfully at:');
console.log('   - ' + preCommitPath);
console.log('   - ' + prePushPath);
