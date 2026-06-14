@echo off
setlocal ENABLEDELAYEDEXPANSION
cd /d %~dp0

echo ========================================
echo NashFit Account Stage 15
echo User cabinet v2 patch
echo ========================================

if not exist "..\my-app\src" (
  echo ERROR: Could not find ..\my-app\src
  echo Extract this folder into D:\diplom next to my-app and fitlab.
  pause
  exit /b 1
)

set BACKUP_ROOT=..\_nashfit_backups
if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
set TS=%date:~-4,4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%
set TS=%TS: =0%
set BACKUP=%BACKUP_ROOT%\account_stage15_%TS%
mkdir "%BACKUP%"

if exist "..\my-app\src\app\account\page.js" (
  mkdir "%BACKUP%\app_account" >nul 2>nul
  copy /Y "..\my-app\src\app\account\page.js" "%BACKUP%\app_account\page.js" >nul
)
if exist "..\my-app\src\components\activity\ActivityTimeline.jsx" (
  mkdir "%BACKUP%\activity" >nul 2>nul
  copy /Y "..\my-app\src\components\activity\ActivityTimeline.jsx" "%BACKUP%\activity\ActivityTimeline.jsx" >nul
)

xcopy ".\my-app\src" "..\my-app\src" /E /I /Y >nul

if errorlevel 1 (
  echo ERROR: Failed to copy files.
  pause
  exit /b 1
)

echo.
echo ACCOUNT STAGE 15 APPLIED SUCCESSFULLY
echo Backup created in: %BACKUP%
echo.
echo Restart frontend:
echo cd D:\diplom\my-app
echo npm run dev
echo.
pause
