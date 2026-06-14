@echo off
setlocal ENABLEDELAYEDEXPANSION
cd /d %~dp0

if not exist "..\my-app\src\app\account" (
  echo ERROR: Could not find ..\my-app\src\app\account
  echo Put this folder inside D:\diplom next to my-app.
  pause
  exit /b 1
)

set BACKUP_ROOT=..\_nashfit_backups
if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
set TS=%date:~-4,4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%
set TS=%TS: =0%
set BACKUP=%BACKUP_ROOT%\account_today_real_hotfix_%TS%
mkdir "%BACKUP%"

if exist "..\my-app\src\app\account\page.js" copy /Y "..\my-app\src\app\account\page.js" "%BACKUP%\account_page.js" >nul

xcopy ".\my-app\src" "..\my-app\src" /E /I /Y >nul

echo ACCOUNT TODAY REAL HOTFIX APPLIED SUCCESSFULLY
echo Restart frontend: cd D:\diplom\my-app && npm run dev
pause
