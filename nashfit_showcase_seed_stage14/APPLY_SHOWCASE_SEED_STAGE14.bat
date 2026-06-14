@echo off
setlocal ENABLEDELAYEDEXPANSION
cd /d %~dp0

if not exist "..\fitlab\artisan" (
  echo Could not find ..\fitlab\artisan
  pause
  exit /b 1
)
if not exist "..\my-app\src" (
  echo Could not find ..\my-app\src
  pause
  exit /b 1
)

set BACKUP_ROOT=..\_nashfit_backups
if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
set TS=%date:~-4,4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%
set TS=%TS: =0%
set BACKUP=%BACKUP_ROOT%\showcase_seed_stage14_%TS%
mkdir "%BACKUP%"
mkdir "%BACKUP%\fitlab\database\seeders" >nul 2>nul
mkdir "%BACKUP%\fitlab\app\Console\Commands" >nul 2>nul
mkdir "%BACKUP%\my-app\src\app\memberships" >nul 2>nul
mkdir "%BACKUP%\my-app\public" >nul 2>nul

if exist "..\fitlab\database\seeders\NashfitDemoContentSeeder.php" copy /Y "..\fitlab\database\seeders\NashfitDemoContentSeeder.php" "%BACKUP%\fitlab\database\seeders\" >nul
if exist "..\fitlab\app\Console\Commands\SeedNashfitDemo.php" copy /Y "..\fitlab\app\Console\Commands\SeedNashfitDemo.php" "%BACKUP%\fitlab\app\Console\Commands\" >nul
if exist "..\fitlab\app\Console\Commands\ClearNashfitDemo.php" copy /Y "..\fitlab\app\Console\Commands\ClearNashfitDemo.php" "%BACKUP%\fitlab\app\Console\Commands\" >nul
if exist "..\my-app\src\app\memberships\page.js" copy /Y "..\my-app\src\app\memberships\page.js" "%BACKUP%\my-app\src\app\memberships\" >nul
if exist "..\my-app\public\demo" xcopy "..\my-app\public\demo" "%BACKUP%\my-app\public\demo\" /E /I /Y >nul

xcopy ".\fitlab" "..\fitlab" /E /I /Y >nul
xcopy ".\my-app" "..\my-app" /E /I /Y >nul

cd /d "..\fitlab"
php artisan optimize:clear

php artisan list | findstr /C:"nashfit:qa" >nul 2>nul
if not errorlevel 1 (
  php artisan nashfit:qa --fix
)

php artisan migrate --force
if errorlevel 1 (
  echo.
  echo MIGRATION FAILED. Backup is here: %BACKUP%
  pause
  exit /b 1
)

php artisan nashfit:seed-demo --force
if errorlevel 1 (
  echo.
  echo SHOWCASE SEED FAILED. Backup is here: %BACKUP%
  pause
  exit /b 1
)

php artisan optimize:clear

echo.
echo SHOWCASE SEED STAGE 14 APPLIED SUCCESSFULLY
echo Backup is here: %BACKUP%
echo Check: /memberships /shop /programs /articles /trainers
pause
