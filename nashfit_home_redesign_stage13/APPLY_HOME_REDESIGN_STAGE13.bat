@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"
set "TARGET_FILE=%PROJECT_ROOT%\my-app\src\components\home\HomeExperience.jsx"
set "PATCH_FILE=%SCRIPT_DIR%my-app\src\components\home\HomeExperience.jsx"
set "BACKUP_DIR=%SCRIPT_DIR%backup"
set "BACKUP_FILE=%BACKUP_DIR%\HomeExperience.stage13.bak"

if not exist "%TARGET_FILE%" (
  echo [ERROR] Не найден файл проекта:
  echo %TARGET_FILE%
  echo.
  echo Распакуйте архив в корень проекта, где лежат папки my-app и fitlab.
  pause
  exit /b 1
)

if not exist "%PATCH_FILE%" (
  echo [ERROR] Не найден файл патча:
  echo %PATCH_FILE%
  pause
  exit /b 1
)

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
copy /Y "%TARGET_FILE%" "%BACKUP_FILE%" >nul
copy /Y "%PATCH_FILE%" "%TARGET_FILE%" >nul

echo.
echo [OK] Новый HomeExperience.jsx установлен.
echo [OK] Резервная копия сохранена в:
 echo %BACKUP_FILE%
echo.
echo Теперь перезапустите фронт:
echo   cd my-app
echo   npm run dev
pause
exit /b 0
