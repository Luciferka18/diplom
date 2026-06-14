@echo off
setlocal ENABLEDELAYEDEXPANSION
cd /d %~dp0

if not exist "..\my-app\src" (
  echo ERROR: Could not find ..\my-app\src
  pause
  exit /b 1
)

if not exist "..\fitlab\artisan" (
  echo ERROR: Could not find ..\fitlab\artisan
  pause
  exit /b 1
)

set BACKUP_ROOT=..\_nashfit_backups
if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
set TS=%date:~-4,4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%
set TS=%TS: =0%
set BACKUP=%BACKUP_ROOT%\home_clubs_stage17_%TS%
mkdir "%BACKUP%"

if exist "..\my-app\src\components\home\HomeExperience.jsx" (
  mkdir "%BACKUP%\my-app\src\components\home" 2>nul
  copy /Y "..\my-app\src\components\home\HomeExperience.jsx" "%BACKUP%\my-app\src\components\home\HomeExperience.jsx" >nul
)
if exist "..\my-app\src\components\Footer.jsx" (
  mkdir "%BACKUP%\my-app\src\components" 2>nul
  copy /Y "..\my-app\src\components\Footer.jsx" "%BACKUP%\my-app\src\components\Footer.jsx" >nul
)
if exist "..\fitlab\app\Http\Controllers\Api\HomeController.php" (
  mkdir "%BACKUP%\fitlab\app\Http\Controllers\Api" 2>nul
  copy /Y "..\fitlab\app\Http\Controllers\Api\HomeController.php" "%BACKUP%\fitlab\app\Http\Controllers\Api\HomeController.php" >nul
)
if exist "..\fitlab\app\Http\Controllers\Api\AdminController.php" (
  mkdir "%BACKUP%\fitlab\app\Http\Controllers\Api" 2>nul
  copy /Y "..\fitlab\app\Http\Controllers\Api\AdminController.php" "%BACKUP%\fitlab\app\Http\Controllers\Api\AdminController.php" >nul
)
if exist "..\fitlab\routes\api.php" (
  mkdir "%BACKUP%\fitlab\routes" 2>nul
  copy /Y "..\fitlab\routes\api.php" "%BACKUP%\fitlab\routes\api.php" >nul
)

xcopy ".\my-app" "..\my-app" /E /I /Y >nul
xcopy ".\fitlab" "..\fitlab" /E /I /Y >nul

cd /d "..\fitlab"
php "..\nashfit_home_clubs_stage17\tools\patch_locations_routes.php"
php artisan optimize:clear
php artisan migrate --force
php artisan optimize:clear

echo.
echo HOME CLUBS STAGE17 APPLIED SUCCESSFULLY
echo Open: / and /admin/locations
pause
