@echo off
setlocal

cd /d "%~dp0"
set "ROOT=%~dp0.."
set "APP=%ROOT%\my-app"
set "SRC=%~dp0my-app\src"
set "BACKUP=%ROOT%\_nashfit_backups\stage11_site_search"

if not exist "%APP%\src\app" (
  echo ERROR: my-app not found. Put this folder inside D:\diplom next to my-app and fitlab.
  pause
  exit /b 1
)

if not exist "%BACKUP%" mkdir "%BACKUP%"
if not exist "%BACKUP%\my-app\src\components" mkdir "%BACKUP%\my-app\src\components"
if not exist "%BACKUP%\my-app\src\app\search" mkdir "%BACKUP%\my-app\src\app\search"

if exist "%APP%\src\components\Navbar.jsx" copy /Y "%APP%\src\components\Navbar.jsx" "%BACKUP%\my-app\src\components\Navbar.jsx" >nul
if exist "%APP%\src\app\search\page.js" copy /Y "%APP%\src\app\search\page.js" "%BACKUP%\my-app\src\app\search\page.js" >nul

xcopy "%SRC%" "%APP%\src" /E /I /Y >nul
if errorlevel 1 (
  echo ERROR: files were not copied.
  pause
  exit /b 1
)

echo.
echo NASHFIT SITE SEARCH STAGE 11 APPLIED SUCCESSFULLY.
echo Backup saved to: %BACKUP%
echo.
echo Restart frontend:
echo cd /d "%APP%"
echo npm run dev
echo.
pause
