@echo off
setlocal
cd /d %~dp0
if not exist "..\fitlab\artisan" (
  echo Could not find ..\fitlab\artisan
  pause
  exit /b 1
)
set BACKUP=..\_nashfit_backups\notifications_schema_hotfix_%DATE:~6,4%-%DATE:~3,2%-%DATE:~0,2%_%TIME:~0,2%-%TIME:~3,2%
set BACKUP=%BACKUP: =0%
mkdir "%BACKUP%" >nul 2>nul
if exist "..\fitlab\app\Console\Commands\NashfitDoctor.php" xcopy "..\fitlab\app\Console\Commands\NashfitDoctor.php" "%BACKUP%\app\Console\Commands\" /Y /I >nul
if exist "..\fitlab\app\Models\UserNotification.php" xcopy "..\fitlab\app\Models\UserNotification.php" "%BACKUP%\app\Models\" /Y /I >nul
xcopy ".\fitlab" "..\fitlab" /E /I /Y >nul
cd /d "..\fitlab"
php artisan optimize:clear
php artisan migrate --force
if errorlevel 1 (
  echo Migration failed. Run: php artisan migrate --force
  pause
  exit /b 1
)
php artisan nashfit:doctor --repair
if errorlevel 1 (
  echo Doctor still found problems. Run: php artisan nashfit:doctor --repair
  pause
  exit /b 1
)
php artisan optimize:clear
echo NOTIFICATIONS SCHEMA HOTFIX APPLIED SUCCESSFULLY
pause
