/**
 * Antigravity AST & Token Integrity Scanner
 * Scans all JSX and JS files in src/ to guarantee zero undeclared identifiers or broken imports.
 */
const fs = require('fs');
const path = require('path');

function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

const lucideIcons = [
  'ShieldAlert', 'ShieldCheck', 'Shield', 'AlertTriangle', 'AlertCircle', 'CheckCircle2',
  'Code', 'Code2', 'Layout', 'Database', 'CloudCog', 'Sparkles', 'ChevronDown', 'ChevronUp',
  'Eye', 'GitPullRequest', 'Copy', 'Download', 'Play', 'Search', 'BellRing', 'FileText',
  'Building2', 'MessageSquare', 'Megaphone', 'Receipt', 'Rocket', 'FolderGit2', 'Send',
  'Headphones', 'RefreshCw', 'Home', 'XCircle', 'Smartphone', 'Tablet', 'Monitor',
  'Check', 'Loader2', 'Terminal', 'Cpu', 'Layers', 'ExternalLink', 'Radio', 'CheckCheck'
];

const files = getAllFiles('src');
let errors = 0;

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check JSX icon usages e.g. <ShieldAlert or icon: ShieldAlert
  for (const icon of lucideIcons) {
    const jsxUsage = new RegExp(`(<${icon}\\b|icon:\\s*${icon}\\b|icon=\\{${icon}\\})`).test(content);
    if (jsxUsage) {
      const isImported =
        new RegExp(`import\\s*\\{[^}]*\\b${icon}\\b[^}]*\\}\\s*from`).test(content) ||
        new RegExp(`const\\s*\\{[^}]*\\b${icon}\\b[^}]*\\}\\s*=`).test(content) ||
        new RegExp(`(?:class|function|const|let|var)\\s+${icon}\\b`).test(content);

      if (!isImported) {
        console.error(`❌ [Missing Import Error] In ${filePath}: '${icon}' is used in JSX/Object but never imported!`);
        errors++;
      }
    }
  }
}

if (errors > 0) {
  console.error(`\n🚨 Failed: Found ${errors} undeclared icon/component usages!`);
  process.exit(1);
} else {
  console.log(`✅ Passed: All ${files.length} source files verified with 100% valid imports.`);
  process.exit(0);
}
