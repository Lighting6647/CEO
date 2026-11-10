@echo off
setlocal
title PUSH TO VERCEL - LIGHTING6647
chcp 65001 >nul
cd /d "D:\AI\Light\CEO"
cls

echo ===================================================
echo   PUSHING COMMITS TO GITHUB (Lighting6647/CEO)
echo ===================================================
echo.

git push lighting main
if errorlevel 1 goto RETRY
goto SUCCESS

:RETRY
echo.
echo [!] Retrying Git push with credential reset...
cmdkey /delete:LegacyGeneric:target=git:https://github.com >nul 2>&1
cmdkey /delete:git:https://github.com >nul 2>&1
git push lighting main
if errorlevel 1 goto FAILED
goto SUCCESS

:SUCCESS
echo.
echo [!] Pushing to Javis backup...
git push javis main >nul 2>&1
echo.
echo ===================================================
echo   PUSH SUCCESSFUL! Vercel is building the live site.
echo   URL: https://ceo-flame.vercel.app/
echo ===================================================
goto END

:FAILED
echo.
echo ===================================================
echo   PUSH FAILED. Please login with Lighting6647.
echo ===================================================

:END
echo.
pause
