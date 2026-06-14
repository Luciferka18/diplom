@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"
set "BACKUP_DIR=%SCRIPT_DIR%backup"

if not exist "%PROJECT_ROOT%\my-app" (
  echo [ERROR] Не найдена папка my-app.
  echo Распакуйте nashfit_home_stage22_steps_fix в корень проекта, где лежат my-app и fitlab.
  pause
  exit /b 1
)

if not exist "%PROJECT_ROOT%\fitlab" (
  echo [ERROR] Не найдена папка fitlab.
  echo Распакуйте nashfit_home_stage22_steps_fix в корень проекта, где лежат my-app и fitlab.
  pause
  exit /b 1
)

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%BACKUP_DIR%\my-app\src\components\home" mkdir "%BACKUP_DIR%\my-app\src\components\home"
if not exist "%BACKUP_DIR%\fitlab\routes" mkdir "%BACKUP_DIR%\fitlab\routes"
if not exist "%BACKUP_DIR%\fitlab\database\seeders" mkdir "%BACKUP_DIR%\fitlab\database\seeders"

if exist "%PROJECT_ROOT%\my-app\src\components\home\HomeExperience.jsx" copy /Y "%PROJECT_ROOT%\my-app\src\components\home\HomeExperience.jsx" "%BACKUP_DIR%\my-app\src\components\home\HomeExperience.jsx.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\routes\api.php" copy /Y "%PROJECT_ROOT%\fitlab\routes\api.php" "%BACKUP_DIR%\fitlab\routes\api.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\database\seeders\DatabaseSeeder.php" copy /Y "%PROJECT_ROOT%\fitlab\database\seeders\DatabaseSeeder.php" "%BACKUP_DIR%\fitlab\database\seeders\DatabaseSeeder.php.bak" >nul

echo.
echo [1/3] Копирую frontend-компоненты...
xcopy "%SCRIPT_DIR%my-app" "%PROJECT_ROOT%\my-app" /E /I /Y >nul
if errorlevel 1 (
  echo [ERROR] Не удалось скопировать my-app.
  pause
  exit /b 1
)

echo [2/3] Копирую Laravel API, модели, миграции и сидер...
xcopy "%SCRIPT_DIR%fitlab" "%PROJECT_ROOT%\fitlab" /E /I /Y >nul
if errorlevel 1 (
  echo [ERROR] Не удалось скопировать fitlab.
  pause
  exit /b 1
)

echo [3/3] Запускаю миграции и seed-данные...
pushd "%PROJECT_ROOT%\fitlab"

php artisan migrate --force
if errorlevel 1 (
  echo.
  echo [WARNING] Миграции не выполнились. Проверьте .env и подключение к базе.
  echo Код уже скопирован. После исправления базы выполните:
  echo   cd fitlab
  echo   php artisan migrate --force
  echo   php artisan db:seed --class=MuscleExerciseSeeder --force
  popd
  pause
  exit /b 0
)

php artisan db:seed --class=MuscleExerciseSeeder --force
if errorlevel 1 (
  echo.
  echo [WARNING] Сидер не выполнился. После исправления выполните:
  echo   cd fitlab
  echo   php artisan db:seed --class=MuscleExerciseSeeder --force
  popd
  pause
  exit /b 0
)

popd

echo.
echo [OK] Stage22 Steps Fix установлен.
echo.
echo Что появилось:
echo - inline SVG muscle map на главной
echo - hover/click подсветка мышц красным
echo - карточка мышцы и упражнения
echo - Laravel API: /api/muscles, /api/muscles/{slug}, /api/muscles/{slug}/exercises, /api/exercises/{slug}
echo.
echo Перезапустите фронт:
echo   cd my-app
echo   npm run dev
echo.
pause
exit /b 0
