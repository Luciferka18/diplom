@echo off
setlocal
cd /d "%~dp0"

if not exist "..\my-app\src\app" (
  echo ERROR: folder ..\my-app\src\app was not found.
  echo Extract this archive into D:\diplom next to my-app and fitlab.
  pause
  exit /b 1
)

set "BACKUP_ROOT=..\_nashfit_backups"
if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
set "BACKUP=%BACKUP_ROOT%\detail_pages_stage12_%RANDOM%"
mkdir "%BACKUP%"

if exist "..\my-app\src\app\shop\[id]\page.js" (
  mkdir "%BACKUP%\shop_id" >nul 2>nul
  copy /Y "..\my-app\src\app\shop\[id]\page.js" "%BACKUP%\shop_id\page.js" >nul
)
if exist "..\my-app\src\app\programs\[id]\page.js" (
  mkdir "%BACKUP%\programs_id" >nul 2>nul
  copy /Y "..\my-app\src\app\programs\[id]\page.js" "%BACKUP%\programs_id\page.js" >nul
)
if exist "..\my-app\src\app\articles\[id]\page.js" (
  mkdir "%BACKUP%\articles_id" >nul 2>nul
  copy /Y "..\my-app\src\app\articles\[id]\page.js" "%BACKUP%\articles_id\page.js" >nul
)
if exist "..\my-app\src\app\trainers\[id]\page.js" (
  mkdir "%BACKUP%\trainers_id" >nul 2>nul
  copy /Y "..\my-app\src\app\trainers\[id]\page.js" "%BACKUP%\trainers_id\page.js" >nul
)

xcopy ".\my-app\src" "..\my-app\src" /E /I /Y >nul

if errorlevel 1 (
  echo ERROR: files were not copied.
  pause
  exit /b 1
)

echo DETAIL PAGES STAGE12 APPLIED SUCCESSFULLY
echo Backup: %BACKUP%
pause
