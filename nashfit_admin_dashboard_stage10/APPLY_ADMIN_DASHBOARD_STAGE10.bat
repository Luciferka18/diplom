@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

set "PATCH_DIR=%~dp0"
set "ROOT=%PATCH_DIR%.."
set "BACKEND=%ROOT%\fitlab"
set "FRONTEND=%ROOT%\my-app"
set "BACKUP_ROOT=%ROOT%\_nashfit_backups"
set "STAMP=%DATE:~-4%%DATE:~3,2%%DATE:~0,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "STAMP=%STAMP: =0%"
set "BACKUP_DIR=%BACKUP_ROOT%\admin_dashboard_stage10_%STAMP%"

echo.
echo === NashFit Stage 10: Admin dashboard v2 ===
echo.

if not exist "%BACKEND%\artisan" (
  echo [ERROR] Laravel project not found: %BACKEND%
  echo Распакуй архив в D:\diplom рядом с папками fitlab и my-app.
  pause
  exit /b 1
)

if not exist "%FRONTEND%\src" (
  echo [ERROR] Next project not found: %FRONTEND%
  echo Распакуй архив в D:\diplom рядом с папками fitlab и my-app.
  pause
  exit /b 1
)

mkdir "%BACKUP_DIR%" >nul 2>nul
mkdir "%BACKUP_DIR%\fitlab\app\Http\Controllers\Api" >nul 2>nul
mkdir "%BACKUP_DIR%\fitlab\routes" >nul 2>nul
mkdir "%BACKUP_DIR%\my-app\src\components\admin" >nul 2>nul
mkdir "%BACKUP_DIR%\my-app\src\app\admin" >nul 2>nul

if exist "%BACKEND%\app\Http\Controllers\Api\AdminDashboardController.php" copy /Y "%BACKEND%\app\Http\Controllers\Api\AdminDashboardController.php" "%BACKUP_DIR%\fitlab\app\Http\Controllers\Api\" >nul
if exist "%BACKEND%\routes\api.php" copy /Y "%BACKEND%\routes\api.php" "%BACKUP_DIR%\fitlab\routes\" >nul
if exist "%FRONTEND%\src\components\admin\AdminDashboardV2.jsx" copy /Y "%FRONTEND%\src\components\admin\AdminDashboardV2.jsx" "%BACKUP_DIR%\my-app\src\components\admin\" >nul
if exist "%FRONTEND%\src\app\admin\page.js" copy /Y "%FRONTEND%\src\app\admin\page.js" "%BACKUP_DIR%\my-app\src\app\admin\" >nul

echo [1/5] Copying backend files...
xcopy "%PATCH_DIR%fitlab\app" "%BACKEND%\app" /E /I /Y >nul
if errorlevel 1 (
  echo [ERROR] Failed to copy backend files.
  pause
  exit /b 1
)

echo [2/5] Copying frontend files...
xcopy "%PATCH_DIR%my-app\src" "%FRONTEND%\src" /E /I /Y >nul
if errorlevel 1 (
  echo [ERROR] Failed to copy frontend files.
  pause
  exit /b 1
)

echo [3/5] Patching Laravel routes...
powershell -NoProfile -ExecutionPolicy Bypass -File "%PATCH_DIR%scripts\PatchRoutes.ps1" -ProjectRoot "%BACKEND%"
if errorlevel 1 (
  echo [ERROR] Failed to patch routes.
  pause
  exit /b 1
)

echo [4/5] Checking PHP syntax...
cd /d "%BACKEND%"
php -l app\Http\Controllers\Api\AdminDashboardController.php
if errorlevel 1 (
  echo [ERROR] PHP syntax check failed.
  pause
  exit /b 1
)

echo [5/5] Clearing Laravel cache...
php artisan optimize:clear
php artisan route:clear

echo.
echo [OK] ADMIN DASHBOARD STAGE 10 APPLIED SUCCESSFULLY
echo Backup saved to: %BACKUP_DIR%
echo.
echo Restart servers:
echo   cd /d %BACKEND%
echo   php artisan serve
echo.
echo   cd /d %FRONTEND%
echo   npm run dev
echo.
pause
