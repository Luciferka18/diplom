@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

echo.
echo ============================================================
echo NASHFIT IMAGE DIAGNOSTIC
echo ============================================================
echo.

echo [1] Frontend images count:
if exist "%PROJECT_ROOT%\my-app\public\seed-images" (
  dir /S /B "%PROJECT_ROOT%\my-app\public\seed-images\*.webp" | find /C ".webp"
) else (
  echo MISSING my-app public seed-images folder
)

echo.
echo [2] Backend images count:
if exist "%PROJECT_ROOT%\fitlab\public\seed-images" (
  dir /S /B "%PROJECT_ROOT%\fitlab\public\seed-images\*.webp" | find /C ".webp"
) else (
  echo MISSING fitlab public seed-images folder
)

echo.
echo [3] Sample files:
if exist "%PROJECT_ROOT%\my-app\public\seed-images\trainers\anna-kuznetsova.webp" (echo OK trainer) else (echo MISSING trainer)
if exist "%PROJECT_ROOT%\my-app\public\seed-images\products\whey-protein-gold-standard\main.webp" (echo OK product) else (echo MISSING product)
if exist "%PROJECT_ROOT%\my-app\public\seed-images\programs\funktsionalnyy-start.webp" (echo OK program) else (echo MISSING program)
if exist "%PROJECT_ROOT%\my-app\public\seed-images\articles\kak-nachat-trenirovatsya.webp" (echo OK article) else (echo MISSING article)

echo.
echo If counts are 50+ and samples are OK, restart Next:
echo cd my-app
echo npm run dev
echo.
pause
exit /b 0
