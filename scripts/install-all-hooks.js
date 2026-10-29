import fs from 'fs';
import path from 'path';

const parentDir = 'D:\\Light';

const targetProjects = [
  'CEO',
  'แดชบอร์ด Light',
  'Sale page Light',
  'Pass App Light',
  'IOS,Asset Light',
  'Tracking Light',
  'Inventoty AI Light',
  'บัญชี Light\\accounting-app',
  'Remote Light',
  'Fitness',
  'เทรด Light\\trading-app',
  'บัตรคอน Light',
  'All Chat Light\\omnichannel-chat-app',
  'Javis',
  'Ad Manager Light'
];

console.log('🚀 Deploying Antigravity Pre-Commit & Pre-Push Hooks across all subprojects...');

let count = 0;
for (const relPath of targetProjects) {
  const fullPath = path.join(parentDir, relPath);
  const hooksDir = path.join(fullPath, '.git', 'hooks');

  if (fs.existsSync(fullPath) && fs.existsSync(path.join(fullPath, '.git'))) {
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    const preCommitScript = `#!/usr/bin/env sh
# Antigravity Gate 1 & 3 Pre-Commit Hook
BANNED_PATTERNS="(\\.env$|\\.db$|\\.mp3$|\\.mp4$|credentials|secret_key|id_rsa)"
COMMITTED_FILES=$(git diff --cached --name-only)
for file in $COMMITTED_FILES; do
  if echo "$file" | grep -Eqi "$BANNED_PATTERNS"; then
    echo "❌ [SECURITY REJECTED] File '$file' matches banned sensitive pattern."
    exit 1
  fi
done
exit 0
`;

    const prePushScript = `#!/usr/bin/env sh
# Antigravity Gate 2 & 3 Pre-Push Hook
if npm run 2>/dev/null | grep -q "test"; then
  npm test || exit 1
fi
exit 0
`;

    fs.writeFileSync(path.join(hooksDir, 'pre-commit'), preCommitScript, { mode: 0o755 });
    fs.writeFileSync(path.join(hooksDir, 'pre-push'), prePushScript, { mode: 0o755 });
    console.log(`✅ [Installed] ${relPath}`);
    count++;
  } else {
    console.log(`⚠️ [Skipped / Not a git repo] ${relPath}`);
  }
}

console.log(`🎉 Total deployed: ${count} repositories protected.`);
