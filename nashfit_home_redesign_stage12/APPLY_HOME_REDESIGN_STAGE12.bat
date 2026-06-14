@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"
set "ROOT=%~dp0.."
set "APP=%ROOT%\my-app"
set "SRC=%~dp0my-app\src"
set "BACKUP=%ROOT%\_nashfit_backups\stage12_home_redesign"

if not exist "%APP%\src\components\home" (
  echo ERROR: my-app not found.
  echo Put folder nashfit_home_redesign_stage12 inside your project root next to my-app and fitlab.
  echo Example: D:\diplom\nashfit_home_redesign_stage12\APPLY_HOME_REDESIGN_STAGE12.bat
  pause
  exit /b 1
)

if not exist "%BACKUP%\my-app\src\components\home" mkdir "%BACKUP%\my-app\src\components\home"

if exist "%APP%\src\components\home\HomeExperience.jsx" (
  copy /Y "%APP%\src\components\home\HomeExperience.jsx" "%BACKUP%\my-app\src\components\home\HomeExperience.jsx" >nul
)

xcopy "%SRC%" "%APP%\src" /E /I /Y >nul
if errorlevel 1 (
  echo ERROR: files were not copied.
  pause
  exit /b 1
)

echo.
echo NASHFIT HOME REDESIGN STAGE 12 APPLIED SUCCESSFULLY.
echo Changed: my-app\src\components\home\HomeExperience.jsx
echo Backup saved to: %BACKUP%
echo.
echo Restart frontend:
echo cd /d "%APP%"
echo npm run dev
echo.
pause
