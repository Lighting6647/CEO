$env:PATH = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;$env:PATH"
Set-Location "D:\Light\CEO"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Launching CEO Master Platform (D:\Light)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
& "C:\Program Files\nodejs\node.exe" scripts/serve-local.js
