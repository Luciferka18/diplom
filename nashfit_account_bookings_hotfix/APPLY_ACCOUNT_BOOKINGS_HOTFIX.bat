@echo off
setlocal ENABLEDELAYEDEXPANSION
cd /d %~dp0

if not exist "..\my-app\src\app\account" (
  echo ERROR: Could not find ..\my-app\src\app\account
  echo Extract this folder into D:\diplom next to my-app and fitlab.
  pause
  exit /b 1
)

if not exist "..\fitlab\artisan" (
  echo ERROR: Could not find ..\fitlab\artisan
  echo Extract this folder into D:\diplom next to my-app and fitlab.
  pause
  exit /b 1
)

set BACKUP_ROOT=..\_nashfit_backups
if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
set BACKUP=%BACKUP_ROOT%\account_bookings_hotfix_%RANDOM%
mkdir "%BACKUP%"

if exist "..\my-app\src\app\account\page.js" copy /Y "..\my-app\src\app\account\page.js" "%BACKUP%\account_page.js" >nul
if exist "..\fitlab\database\migrations" mkdir "%BACKUP%\migrations" >nul 2>nul
if exist "..\fitlab\database\migrations\2026_06_14_090000_repair_bookings_for_account_dashboard.php" copy /Y "..\fitlab\database\migrations\2026_06_14_090000_repair_bookings_for_account_dashboard.php" "%BACKUP%\migrations\" >nul

xcopy ".\my-app\src" "..\my-app\src" /E /I /Y >nul
xcopy ".\fitlab\database\migrations" "..\fitlab\database\migrations" /E /I /Y >nul

cd /d "..\fitlab"
php artisan optimize:clear
php artisan migrate --force
php artisan optimize:clear

echo.
echo ACCOUNT BOOKINGS HOTFIX APPLIED SUCCESSFULLY
echo Restart frontend: cd D:\diplom\my-app && npm run dev
echo Restart backend if it is already running.
pause
