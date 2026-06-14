@echo off
setlocal
cd /d %~dp0

if not exist "..\fitlab\artisan" (
  echo Could not find ..\fitlab\artisan
  echo Put this folder inside D:\diplom next to fitlab and my-app.
  pause
  exit /b 1
)

set BACKUP=..\_nashfit_backups\qa_stage9_%DATE:~6,4%-%DATE:~3,2%-%DATE:~0,2%_%TIME:~0,2%-%TIME:~3,2%
set BACKUP=%BACKUP: =0%
mkdir "%BACKUP%\fitlab\app\Console\Commands" >nul 2>nul

if exist "..\fitlab\app\Console\Commands\NashfitQa.php" (
  copy "..\fitlab\app\Console\Commands\NashfitQa.php" "%BACKUP%\fitlab\app\Console\Commands\NashfitQa.php" >nul
)

copy ".\fitlab\app\Console\Commands\NashfitQa.php" "..\fitlab\app\Console\Commands\NashfitQa.php" /Y >nul

cd /d "..\fitlab"
php artisan optimize:clear
php artisan nashfit:qa --fix

if errorlevel 1 (
  echo.
  echo QA STAGE 9 INSTALLED, BUT QA STILL FOUND PROBLEMS.
  echo Run this command and send the output if needed:
  echo php artisan nashfit:qa
  pause
  exit /b 1
)

echo.
echo NASHFIT QA STAGE 9 APPLIED SUCCESSFULLY
echo Run anytime: php artisan nashfit:qa
echo Repair anytime: php artisan nashfit:qa --fix
pause
