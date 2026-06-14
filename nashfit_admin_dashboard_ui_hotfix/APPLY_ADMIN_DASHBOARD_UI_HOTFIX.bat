@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul

cd /d "%~dp0"
set "PATCH_DIR=%~dp0"
set "ROOT_DIR=%~dp0.."
set "APP_DIR=%ROOT_DIR%\my-app"

if not exist "%APP_DIR%\src" (
  echo [ERROR] Не найдена папка my-app\src рядом с патчем.
  echo Распакуй архив в D:\diplom, чтобы рядом были my-app и fitlab.
  pause
  exit /b 1
)

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "STAMP=%%I"
set "BACKUP_DIR=%ROOT_DIR%\_nashfit_backups\admin_dashboard_ui_hotfix_%STAMP%"

mkdir "%BACKUP_DIR%" >nul 2>nul
mkdir "%BACKUP_DIR%\my-app\src\components\admin" >nul 2>nul
mkdir "%BACKUP_DIR%\my-app\src\app\admin" >nul 2>nul

if exist "%APP_DIR%\src\components\admin\AdminDashboardV2.jsx" copy /Y "%APP_DIR%\src\components\admin\AdminDashboardV2.jsx" "%BACKUP_DIR%\my-app\src\components\admin\AdminDashboardV2.jsx" >nul
if exist "%APP_DIR%\src\app\admin\page.js" copy /Y "%APP_DIR%\src\app\admin\page.js" "%BACKUP_DIR%\my-app\src\app\admin\page.js" >nul

xcopy "%PATCH_DIR%my-app\src" "%APP_DIR%\src" /E /I /Y >nul
if errorlevel 1 (
  echo [ERROR] Не удалось скопировать файлы патча.
  pause
  exit /b 1
)

echo.
echo [OK] Admin dashboard UI hotfix applied.
echo [OK] Backup: %BACKUP_DIR%
echo.
echo Перезапусти frontend:
echo cd /d %APP_DIR%
echo npm run dev
echo.
pause
