@echo off
setlocal
chcp 65001 >nul

set "PATCH_DIR=%~dp0"
set "ROOT=%PATCH_DIR%.."
set "APP_DIR=%ROOT%\my-app"

if not exist "%APP_DIR%\src\app" (
  echo [ERROR] Не найдена папка my-app\src\app рядом с этим патчем.
  echo Распакуй архив в D:\diplom, чтобы рядом были папки my-app и fitlab.
  pause
  exit /b 1
)

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "TS=%%i"
set "BACKUP_DIR=%ROOT%\_nashfit_backups\search_smart_stage11_hotfix_%TS%"

mkdir "%BACKUP_DIR%\my-app\src\app\search" >nul 2>nul

if exist "%APP_DIR%\src\app\search\page.js" (
  copy /Y "%APP_DIR%\src\app\search\page.js" "%BACKUP_DIR%\my-app\src\app\search\page.js" >nul
)

xcopy "%PATCH_DIR%my-app\src" "%APP_DIR%\src" /E /I /Y >nul

if errorlevel 1 (
  echo [ERROR] Не удалось скопировать файлы патча.
  pause
  exit /b 1
)

echo.
echo [OK] Умный поиск установлен.
echo Backup: %BACKUP_DIR%
echo.
echo Теперь перезапусти frontend:
echo cd /d D:\diplom\my-app
echo npm run dev
echo.
pause
exit /b 0
