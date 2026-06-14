@echo off
setlocal enabledelayedexpansion
cd /d %~dp0

if not exist "..\fitlab\artisan" (
  echo ERROR: Could not find ..\fitlab\artisan
  pause
  exit /b 1
)
if not exist "..\my-app\src" (
  echo ERROR: Could not find ..\my-app\src
  pause
  exit /b 1
)

set TS=%DATE:~6,4%-%DATE:~3,2%-%DATE:~0,2%_%TIME:~0,2%-%TIME:~3,2%-%TIME:~6,2%
set TS=%TS: =0%
set BACKUP=..\_nashfit_backups\notifications_stage6_%TS%
mkdir "%BACKUP%" >nul 2>nul

echo Creating backup in %BACKUP% ...
for %%F in (
  "..\fitlab\routes\api.php"
  "..\fitlab\app\Models\User.php"
  "..\fitlab\app\Services\PaymentService.php"
  "..\fitlab\app\Http\Controllers\Api\BookingController.php"
  "..\fitlab\app\Http\Controllers\Api\OrderController.php"
  "..\fitlab\app\Http\Controllers\Api\ArticleController.php"
  "..\fitlab\app\Http\Controllers\Api\ProgramProgressController.php"
  "..\my-app\src\components\Navbar.jsx"
  "..\my-app\src\components\account\AccountNavigation.jsx"
  "..\my-app\src\app\account\page.js"
  "..\my-app\src\components\admin\AdminDashboard.jsx"
) do (
  if exist %%F (
    for %%A in (%%F) do (
      mkdir "%BACKUP%\%%~pA" >nul 2>nul
      copy /Y %%F "%BACKUP%\%%~pA%%~nxA" >nul
    )
  )
)

echo Copying files...
xcopy ".\fitlab" "..\fitlab" /E /I /Y >nul
xcopy ".\my-app" "..\my-app" /E /I /Y >nul

echo Clearing Laravel cache and running migration...
cd /d "..\fitlab"
php artisan optimize:clear
if errorlevel 1 (
  echo WARNING: optimize:clear failed, continuing...
)
php artisan migrate --path=database/migrations/2026_06_12_160000_create_notifications_and_activity_events.php --force
if errorlevel 1 (
  echo ERROR: migration failed.
  pause
  exit /b 1
)
php artisan route:clear
php artisan config:clear
composer dump-autoload

cd /d "..\my-app"
if exist ".next" rmdir /S /Q ".next"

echo.
echo NOTIFICATIONS STAGE 6 APPLIED SUCCESSFULLY
echo Start servers again if they are not running:
echo   cd D:\diplom\fitlab ^&^& php artisan serve
echo   cd D:\diplom\my-app ^&^& npm run dev
echo.
pause
