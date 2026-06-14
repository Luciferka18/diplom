@echo off
setlocal
cd /d %~dp0

if not exist "..\fitlab\artisan" (
  echo ERROR: Could not find ..\fitlab\artisan
  pause
  exit /b 1
)

set TS=%DATE:~6,4%-%DATE:~3,2%-%DATE:~0,2%_%TIME:~0,2%-%TIME:~3,2%-%TIME:~6,2%
set TS=%TS: =0%
set BACKUP=..\_nashfit_backups\notifications_table_hotfix_%TS%
mkdir "%BACKUP%" >nul 2>nul

if exist "..\fitlab\database\migrations\2026_06_12_160000_create_notifications_and_activity_events.php" (
  mkdir "%BACKUP%\fitlab\database\migrations" >nul 2>nul
  copy /Y "..\fitlab\database\migrations\2026_06_12_160000_create_notifications_and_activity_events.php" "%BACKUP%\fitlab\database\migrations\" >nul
)
if exist "..\fitlab\nashfit_fix_notifications_tables.php" (
  mkdir "%BACKUP%\fitlab" >nul 2>nul
  copy /Y "..\fitlab\nashfit_fix_notifications_tables.php" "%BACKUP%\fitlab\" >nul
)

echo Copying notification migration and repair script...
xcopy ".\fitlab" "..\fitlab" /E /I /Y >nul

cd /d "..\fitlab"
echo Clearing cache...
php artisan optimize:clear

echo Running notification migration...
php artisan migrate --path=database/migrations/2026_06_12_160000_create_notifications_and_activity_events.php --force

echo Checking and creating notification tables if needed...
php nashfit_fix_notifications_tables.php
if errorlevel 1 (
  echo ERROR: Could not create notification tables.
  pause
  exit /b 1
)

echo Clearing cache again...
php artisan optimize:clear
php artisan route:clear
php artisan config:clear

echo.
echo NOTIFICATIONS TABLE HOTFIX APPLIED SUCCESSFULLY
echo Restart Laravel and Next.js, then refresh the page with Ctrl+F5.
echo.
pause
