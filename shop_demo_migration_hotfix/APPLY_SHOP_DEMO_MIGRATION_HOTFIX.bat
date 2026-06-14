@echo off
setlocal
cd /d %~dp0
if not exist "..\fitlab\artisan" (
  echo ERROR: Could not find ..\fitlab\artisan
  echo Put this folder inside D:\diplom, next to fitlab and my-app.
  pause
  exit /b 1
)
set BACKUP=..\_nashfit_backups\shop_demo_migration_hotfix_%DATE:~6,4%-%DATE:~3,2%-%DATE:~0,2%_%TIME:~0,2%-%TIME:~3,2%
set BACKUP=%BACKUP: =0%
mkdir "%BACKUP%" >nul 2>nul
mkdir "%BACKUP%\fitlab\database\migrations" >nul 2>nul
mkdir "%BACKUP%\fitlab\database\seeders" >nul 2>nul
if exist "..\fitlab\database\migrations\2026_06_12_120000_upgrade_shop_experience.php" copy "..\fitlab\database\migrations\2026_06_12_120000_upgrade_shop_experience.php" "%BACKUP%\fitlab\database\migrations\" >nul
if exist "..\fitlab\database\seeders\NashfitDemoContentSeeder.php" copy "..\fitlab\database\seeders\NashfitDemoContentSeeder.php" "%BACKUP%\fitlab\database\seeders\" >nul
xcopy ".\fitlab" "..\fitlab" /E /I /Y >nul
cd /d "..\fitlab"
php artisan optimize:clear
if errorlevel 1 goto fail
php artisan migrate --force
if errorlevel 1 goto fail
php artisan nashfit:seed-demo --force
if errorlevel 1 goto fail
php artisan optimize:clear
if errorlevel 1 goto fail
echo.
echo SHOP DEMO MIGRATION HOTFIX APPLIED SUCCESSFULLY
echo You can now refresh the site.
pause
exit /b 0
:fail
echo.
echo HOTFIX FAILED. Check the error above. Backup was saved here:
echo %BACKUP%
pause
exit /b 1
