# PowerShell Push Script for คุณไลท์
Set-Location "D:\AI\Light\CEO"
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   PUSHING COMMITS TO GITHUB (Lighting6647/CEO)" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

git push lighting main
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[!] Retrying with Git Credential reset..." -ForegroundColor Yellow
    cmdkey /delete:LegacyGeneric:target=git:https://github.com 2>$null
    cmdkey /delete:git:https://github.com 2>$null
    git push lighting main
}

if ($LASTEXITCODE -eq 0) {
    git push javis main 2>$null
    Write-Host "`n===================================================" -ForegroundColor Green
    Write-Host "   PUSH SUCCESSFUL! Vercel is updating now." -ForegroundColor Green
    Write-Host "   URL: https://ceo-flame.vercel.app/" -ForegroundColor Cyan
    Write-Host "===================================================" -ForegroundColor Green
} else {
    Write-Host "`n[X] Push failed. Please check GitHub login for Lighting6647." -ForegroundColor Red
}
