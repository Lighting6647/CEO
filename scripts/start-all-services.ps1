param(
    [switch]$LaunchCeoPortal = $false
)

$ErrorActionPreference = "Continue"

# Ensure Node.js, Git, and Python paths are active in current session
$extraPaths = @(
    "C:\Program Files\nodejs",
    "C:\Program Files\Git\cmd",
    "$env:LOCALAPPDATA\Programs\Python\Python312",
    "$env:LOCALAPPDATA\Programs\Python\Python312\Scripts"
)
foreach ($p in $extraPaths) {
    if ((Test-Path $p) -and ($env:PATH -notlike "*$p*")) {
        $env:PATH = "$p;$env:PATH"
    }
}

Write-Output "=========================================================="
Write-Output "🚀 KROB (D:\Light) Environment Doctor & Service Launcher"
Write-Output "=========================================================="
Write-Output "Node.js : $(node -v 2>$null)"
Write-Output "Git     : $(git --version 2>$null)"
Write-Output "Python  : $(python --version 2>$null)"

Push-Location "D:\Light\CEO"
Write-Output "`n[1/2] Generating 17-Project Workspace Backup Snapshot..."
node scripts/backup-workspace-snapshot.js

Write-Output "`n[2/2] Running CEO Master Portal Verification Suite..."
node --test tests/company-hub.test.js

if ($LaunchCeoPortal) {
    Write-Output "`n🌐 Starting CEO Master Portal on http://localhost:5173 ..."
    npm.cmd run dev
}
Pop-Location
