@echo off
setlocal ENABLEDELAYEDEXPANSION
cd /d %~dp0

if not exist "..\my-app\src\components" (
  echo ERROR: Could not find ..\my-app\src\components
  echo Extract this folder into D:\diplom next to my-app and fitlab.
  pause
  exit /b 1
)

set BACKUP_ROOT=..\_nashfit_backups
if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
set TS=%date:~-4,4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%
set TS=%TS: =0%
set BACKUP=%BACKUP_ROOT%\footer_socials_restore_%TS%
mkdir "%BACKUP%"

if exist "..\my-app\src\components\Footer.jsx" copy /Y "..\my-app\src\components\Footer.jsx" "%BACKUP%\Footer.jsx" >nul
xcopy ".\my-app\src" "..\my-app\src" /E /I /Y >nul

echo FOOTER SOCIALS RESTORED SUCCESSFULLY
pause
