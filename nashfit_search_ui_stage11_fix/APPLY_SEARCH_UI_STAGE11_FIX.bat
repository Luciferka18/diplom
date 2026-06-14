@echo off
setlocal ENABLEDELAYEDEXPANSION
cd /d %~dp0
if not exist "..\my-app\src\app\search" (
  echo Could not find ..\my-app\src\app\search
  pause
  exit /b 1
)
set BACKUP_ROOT=..\_nashfit_backups
if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
set TS=%date:~-4,4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%
set TS=%TS: =0%
set BACKUP=%BACKUP_ROOT%\search_ui_stage11_fix_%TS%
mkdir "%BACKUP%"
if exist "..\my-app\src\app\search\page.js" copy /Y "..\my-app\src\app\search\page.js" "%BACKUP%\page.js" >nul
xcopy ".\my-app\src" "..\my-app\src" /E /I /Y >nul
echo SEARCH UI STAGE11 FIX APPLIED SUCCESSFULLY
pause
