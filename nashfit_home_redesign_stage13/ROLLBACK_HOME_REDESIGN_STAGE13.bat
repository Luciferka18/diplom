@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"
set "TARGET_FILE=%PROJECT_ROOT%\my-app\src\components\home\HomeExperience.jsx"
set "BACKUP_FILE=%SCRIPT_DIR%backup\HomeExperience.stage13.bak"

if not exist "%BACKUP_FILE%" (
  echo [ERROR] Не найдена резервная копия:
  echo %BACKUP_FILE%
  pause
  exit /b 1
)

copy /Y "%BACKUP_FILE%" "%TARGET_FILE%" >nul

echo.
echo [OK] Исходный HomeExperience.jsx восстановлен.
pause
exit /b 0
