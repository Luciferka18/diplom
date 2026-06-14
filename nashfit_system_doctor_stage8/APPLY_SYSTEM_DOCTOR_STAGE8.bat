@echo off
setlocal
cd /d %~dp0
if not exist "..\fitlab\artisan" (
  echo Could not find ..\fitlab\artisan. Put this folder inside D:\diplom next to fitlab and my-app.
  pause
  exit /b 1
)
set BACKUP=..\_nashfit_backups\system_doctor_stage8_%DATE:~6,4%-%DATE:~3,2%-%DATE:~0,2%_%TIME:~0,2%-%TIME:~3,2%
set BACKUP=%BACKUP: =0%
mkdir "%BACKUP%" >nul 2>nul
xcopy "..\fitlab\app\Console\Commands" "%BACKUP%\app\Console\Commands\" /E /I /Y >nul
xcopy "..\fitlab\database\migrations\2026_06_12_120000_upgrade_shop_experience.php" "%BACKUP%\database\migrations\" /Y /I >nul 2>nul
xcopy "..\fitlab\database\migrations\2026_06_13_230000_repair_shop_demo_schema.php" "%BACKUP%\database\migrations\" /Y /I >nul 2>nul
xcopy ".\fitlab" "..\fitlab" /E /I /Y >nul
cd /d "..\fitlab"
php artisan optimize:clear
php artisan nashfit:doctor --repair
if errorlevel 1 (
  echo Doctor repair failed.
  pause
  exit /b 1
)
php artisan migrate --force
if errorlevel 1 (
  echo Migration still failed. Run: php artisan nashfit:doctor --repair
  pause
  exit /b 1
)
php artisan nashfit:seed-demo --force
if errorlevel 1 (
  echo Demo seeder failed. Run: php artisan nashfit:doctor --repair, then try seed again.
  pause
  exit /b 1
)
php artisan nashfit:doctor
php artisan optimize:clear
echo SYSTEM DOCTOR STAGE 8 APPLIED SUCCESSFULLY
pause
