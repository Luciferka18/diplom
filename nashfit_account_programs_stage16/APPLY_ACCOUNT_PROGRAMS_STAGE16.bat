@echo off
setlocal ENABLEDELAYEDEXPANSION
cd /d %~dp0

if not exist "..\my-app\src" (
  echo Could not find ..\my-app\src
  pause
  exit /b 1
)
if not exist "..\fitlab\artisan" (
  echo Could not find ..\fitlab\artisan
  pause
  exit /b 1
)

set BACKUP_ROOT=..\_nashfit_backups
if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
set TS=%date:~-4,4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%
set TS=%TS: =0%
set BACKUP=%BACKUP_ROOT%\account_programs_stage16_%TS%
mkdir "%BACKUP%"

if exist "..\my-app\src\app\account\page.js" (
  mkdir "%BACKUP%\my-app\src\app\account" 2>nul
  copy /Y "..\my-app\src\app\account\page.js" "%BACKUP%\my-app\src\app\account\page.js" >nul
)
if exist "..\my-app\src\app\programs\[id]\page.js" (
  mkdir "%BACKUP%\my-app\src\app\programs\[id]" 2>nul
  copy /Y "..\my-app\src\app\programs\[id]\page.js" "%BACKUP%\my-app\src\app\programs\[id]\page.js" >nul
)
if exist "..\my-app\src\components\account\AccountNavigation.jsx" (
  mkdir "%BACKUP%\my-app\src\components\account" 2>nul
  copy /Y "..\my-app\src\components\account\AccountNavigation.jsx" "%BACKUP%\my-app\src\components\account\AccountNavigation.jsx" >nul
)
if exist "..\my-app\src\components\activity\ActivityTimeline.jsx" (
  mkdir "%BACKUP%\my-app\src\components\activity" 2>nul
  copy /Y "..\my-app\src\components\activity\ActivityTimeline.jsx" "%BACKUP%\my-app\src\components\activity\ActivityTimeline.jsx" >nul
)
if exist "..\my-app\src\components\recommendations\RecommendationHub.jsx" (
  mkdir "%BACKUP%\my-app\src\components\recommendations" 2>nul
  copy /Y "..\my-app\src\components\recommendations\RecommendationHub.jsx" "%BACKUP%\my-app\src\components\recommendations\RecommendationHub.jsx" >nul
)
if exist "..\fitlab\app\Http\Controllers\Api\AuthController.php" (
  mkdir "%BACKUP%\fitlab\app\Http\Controllers\Api" 2>nul
  copy /Y "..\fitlab\app\Http\Controllers\Api\AuthController.php" "%BACKUP%\fitlab\app\Http\Controllers\Api\AuthController.php" >nul
)
if exist "..\fitlab\routes\api.php" (
  mkdir "%BACKUP%\fitlab\routes" 2>nul
  copy /Y "..\fitlab\routes\api.php" "%BACKUP%\fitlab\routes\api.php" >nul
)

xcopy ".\my-app\src" "..\my-app\src" /E /I /Y >nul
php ".\tools\patch_profile_endpoint.php"
if errorlevel 1 (
  echo Backend profile endpoint patch failed.
  pause
  exit /b 1
)

cd /d "..\fitlab"
php artisan optimize:clear
cd /d "%~dp0"

echo ACCOUNT PROGRAMS STAGE16 APPLIED SUCCESSFULLY
echo Backup saved to %BACKUP%
pause
