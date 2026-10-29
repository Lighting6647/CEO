const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function installMinGit() {
  const targetDir = 'C:\\Users\\Light\\AppData\\Local\\Programs\\Git';
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const zipPath = path.join(targetDir, 'mingit.zip');
  console.log('Fetching MinGit release URL...');

  const releaseInfo = await new Promise((resolve, reject) => {
    https.get(
      'https://api.github.com/repos/git-for-windows/git/releases/latest',
      { headers: { 'User-Agent': 'Node.js' } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      }
    ).on('error', reject);
  });

  const asset = releaseInfo.assets.find(
    (a) =>
      a.name.startsWith('MinGit-') &&
      a.name.endsWith('-64-bit.zip') &&
      !a.name.includes('busybox')
  );
  if (!asset) {
    console.error('Could not find MinGit asset');
    return;
  }

  console.log('Downloading MinGit from:', asset.browser_download_url);
  await new Promise((resolve, reject) => {
    function get(url) {
      https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location);
          return;
        }
        const fileStream = fs.createWriteStream(zipPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log('Download complete!');
          resolve();
        });
      }).on('error', reject);
    }
    get(asset.browser_download_url);
  });

  console.log('Extracting MinGit...');
  execSync(`tar -xf "${zipPath}" -C "${targetDir}"`);
  console.log('Extraction complete! Checking git.exe:');
  const gitExe = path.join(targetDir, 'cmd', 'git.exe');
  if (fs.existsSync(gitExe)) {
    console.log('git.exe verified at:', gitExe);
    console.log('Version:', execSync(`"${gitExe}" --version`).toString().trim());
  }
}

installMinGit().catch(console.error);
