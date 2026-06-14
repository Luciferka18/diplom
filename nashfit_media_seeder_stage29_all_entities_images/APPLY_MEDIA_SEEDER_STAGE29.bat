@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"
set "BACKUP_DIR=%SCRIPT_DIR%backup"

if not exist "%PROJECT_ROOT%\my-app" (
  echo [ERROR] Не найдена папка my-app.
  echo Распакуйте nashfit_media_seeder_stage29_all_entities_images в корень проекта, где лежат my-app и fitlab.
  pause
  exit /b 1
)

if not exist "%PROJECT_ROOT%\fitlab" (
  echo [ERROR] Не найдена папка fitlab.
  echo Распакуйте nashfit_media_seeder_stage29_all_entities_images в корень проекта, где лежат my-app и fitlab.
  pause
  exit /b 1
)

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%BACKUP_DIR%\my-app\src\components\home" mkdir "%BACKUP_DIR%\my-app\src\components\home"
if not exist "%BACKUP_DIR%\fitlab\routes" mkdir "%BACKUP_DIR%\fitlab\routes"
if not exist "%BACKUP_DIR%\fitlab\database\seeders" mkdir "%BACKUP_DIR%\fitlab\database\seeders"
if not exist "%BACKUP_DIR%\fitlab\app\Models" mkdir "%BACKUP_DIR%\fitlab\app\Models"

if exist "%PROJECT_ROOT%\my-app\src\components\home\HomeExperience.jsx" copy /Y "%PROJECT_ROOT%\my-app\src\components\home\HomeExperience.jsx" "%BACKUP_DIR%\my-app\src\components\home\HomeExperience.jsx.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\routes\api.php" copy /Y "%PROJECT_ROOT%\fitlab\routes\api.php" "%BACKUP_DIR%\fitlab\routes\api.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\database\seeders\DatabaseSeeder.php" copy /Y "%PROJECT_ROOT%\fitlab\database\seeders\DatabaseSeeder.php" "%BACKUP_DIR%\fitlab\database\seeders\DatabaseSeeder.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\database\seeders\TrainerSeeder.php" copy /Y "%PROJECT_ROOT%\fitlab\database\seeders\TrainerSeeder.php" "%BACKUP_DIR%\fitlab\database\seeders\TrainerSeeder.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\database\seeders\ProductSeeder.php" copy /Y "%PROJECT_ROOT%\fitlab\database\seeders\ProductSeeder.php" "%BACKUP_DIR%\fitlab\database\seeders\ProductSeeder.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\database\seeders\ArticleSeeder.php" copy /Y "%PROJECT_ROOT%\fitlab\database\seeders\ArticleSeeder.php" "%BACKUP_DIR%\fitlab\database\seeders\ArticleSeeder.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\database\seeders\ProgramSeeder.php" copy /Y "%PROJECT_ROOT%\fitlab\database\seeders\ProgramSeeder.php" "%BACKUP_DIR%\fitlab\database\seeders\ProgramSeeder.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\database\seeders\UserSeeder.php" copy /Y "%PROJECT_ROOT%\fitlab\database\seeders\UserSeeder.php" "%BACKUP_DIR%\fitlab\database\seeders\UserSeeder.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\app\Models\User.php" copy /Y "%PROJECT_ROOT%\fitlab\app\Models\User.php" "%BACKUP_DIR%\fitlab\app\Models\User.php.bak" >nul

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

php artisan db:seed --class=UserSeeder --force
if errorlevel 1 (
  echo.
  echo [WARNING] UserSeeder не выполнился. Проверьте таблицу users и подключение к базе.
  popd
  pause
  exit /b 0
)

php artisan db:seed --class=TrainerSeeder --force
if errorlevel 1 (
  echo.
  echo [WARNING] TrainerSeeder не выполнился. Проверьте подключение к базе.
  popd
  pause
  exit /b 0
)

php artisan db:seed --class=ProductSeeder --force
if errorlevel 1 (
  echo.
  echo [WARNING] ProductSeeder не выполнился. Проверьте таблицы products/product_variants и подключение к базе.
  popd
  pause
  exit /b 0
)

php artisan db:seed --class=ProgramSeeder --force
if errorlevel 1 (
  echo.
  echo [WARNING] ProgramSeeder не выполнился. Проверьте таблицу programs и подключение к базе.
  popd
  pause
  exit /b 0
)

php artisan db:seed --class=ArticleSeeder --force
if errorlevel 1 (
  echo.
  echo [WARNING] ArticleSeeder не выполнился. Проверьте таблицы articles/users и подключение к базе.
  popd
  pause
  exit /b 0
)

php artisan db:seed --class=MuscleExerciseSeeder --force
if errorlevel 1 (
  echo.
  echo [WARNING] MuscleExerciseSeeder не выполнился. Остальные медиа-сидеры уже могли примениться.
)

popd

echo.
echo [OK] Media Seeder Stage29 установлен.
echo.
echo Что появилось:
echo - WebP-картинки продублированы и в fitlab/public/seed-images, и в my-app/public/seed-images
echo - аватары всех пользователей в UserSeeder
echo - фото всех тренеров в TrainerSeeder
echo - обложки всех статей в ArticleSeeder
echo - картинки, галереи и варианты всех товаров в ProductSeeder
echo - картинки всех программ в ProgramSeeder
echo.
echo После установки перезапустите фронт:
echo   cd my-app
echo   npm run dev
echo.
pause
exit /b 0
