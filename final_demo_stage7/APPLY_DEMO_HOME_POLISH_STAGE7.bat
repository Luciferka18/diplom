@echo off
setlocal
cd /d %~dp0
if not exist "..\fitlab\artisan" (
  echo Could not find ..\fitlab\artisan
  pause
  exit /b 1
)
if not exist "..\my-app\public" (
  echo Could not find ..\my-app\public
  pause
  exit /b 1
)
set BACKUP=..\_nashfit_backups\demo_home_polish_stage7_%DATE:~6,4%-%DATE:~3,2%-%DATE:~0,2%_%TIME:~0,2%-%TIME:~3,2%
set BACKUP=%BACKUP: =0%
mkdir "%BACKUP%" >nul 2>nul
mkdir "%BACKUP%\fitlab\database\seeders" >nul 2>nul
mkdir "%BACKUP%\fitlab\app\Console\Commands" >nul 2>nul
mkdir "%BACKUP%\my-app\public" >nul 2>nul
if exist "..\fitlab\database\seeders\NashfitDemoContentSeeder.php" copy "..\fitlab\database\seeders\NashfitDemoContentSeeder.php" "%BACKUP%\fitlab\database\seeders\" >nul
if exist "..\fitlab\app\Console\Commands\SeedNashfitDemo.php" copy "..\fitlab\app\Console\Commands\SeedNashfitDemo.php" "%BACKUP%\fitlab\app\Console\Commands\" >nul
if exist "..\fitlab\app\Console\Commands\ClearNashfitDemo.php" copy "..\fitlab\app\Console\Commands\ClearNashfitDemo.php" "%BACKUP%\fitlab\app\Console\Commands\" >nul
if exist "..\my-app\public\demo" xcopy "..\my-app\public\demo" "%BACKUP%\my-app\public\demo\" /E /I /Y >nul
xcopy ".\fitlab" "..\fitlab" /E /I /Y >nul
xcopy ".\my-app" "..\my-app" /E /I /Y >nul
cd /d "..\fitlab"
php artisan optimize:clear
php artisan migrate --force
php artisan nashfit:seed-demo --force
if errorlevel 1 (
  echo.
  echo DEMO CONTENT STAGE 7 FAILED
  echo Backup is here: %BACKUP%
  pause
  exit /b 1
)
echo.
echo DEMO CONTENT AND HOME DATA STAGE 7 APPLIED SUCCESSFULLY
echo Backup is here: %BACKUP%
pause
