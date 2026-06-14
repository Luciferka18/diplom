@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"
set "ROOT=%~dp0.."
set "APP=%ROOT%\my-app"
set "BACKUP=%ROOT%\_nashfit_backups\stage12_home_redesign"

if not exist "%BACKUP%\my-app\src\components\home\HomeExperience.jsx" (
  echo ERROR: backup was not found.
  echo Expected: %BACKUP%\my-app\src\components\home\HomeExperience.jsx
  pause
  exit /b 1
)

copy /Y "%BACKUP%\my-app\src\components\home\HomeExperience.jsx" "%APP%\src\components\home\HomeExperience.jsx" >nul
if errorlevel 1 (
  echo ERROR: rollback failed.
  pause
  exit /b 1
)

echo.
echo NASHFIT HOME REDESIGN STAGE 12 ROLLED BACK.
echo Restart frontend:
echo cd /d "%APP%"
echo npm run dev
echo.
pause
