@echo off
chcp 65001 >nul
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"
set "BACKUP_DIR=%SCRIPT_DIR%backup_stage32"

echo.
echo ============================================================
echo   NASHFIT STAGE32 - ONE CLICK MEDIA SEED
echo ============================================================
echo.

if not exist "%PROJECT_ROOT%\my-app" (
  echo [ERROR] Не найдена папка my-app.
  echo Распакуйте папку nashfit_stage32_one_click_media_seed в корень проекта,
  echo где рядом лежат my-app и fitlab.
  pause
  exit /b 1
)

if not exist "%PROJECT_ROOT%\fitlab" (
  echo [ERROR] Не найдена папка fitlab.
  echo Распакуйте папку nashfit_stage32_one_click_media_seed в корень проекта,
  echo где рядом лежат my-app и fitlab.
  pause
  exit /b 1
)

where php >nul 2>nul
if errorlevel 1 (
  echo [ERROR] PHP не найден в PATH. Запустите батник из окружения, где работает php artisan.
  pause
  exit /b 1
)

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%BACKUP_DIR%\fitlab\database\seeders" mkdir "%BACKUP_DIR%\fitlab\database\seeders"
if not exist "%BACKUP_DIR%\fitlab\app\Models" mkdir "%BACKUP_DIR%\fitlab\app\Models"
if not exist "%BACKUP_DIR%\fitlab\app\Http\Resources" mkdir "%BACKUP_DIR%\fitlab\app\Http\Resources"
if not exist "%BACKUP_DIR%\fitlab\routes" mkdir "%BACKUP_DIR%\fitlab\routes"
if not exist "%BACKUP_DIR%\my-app\src\components" mkdir "%BACKUP_DIR%\my-app\src\components"
if not exist "%BACKUP_DIR%\my-app\src\components\home" mkdir "%BACKUP_DIR%\my-app\src\components\home"

echo [1/6] Делаю backup важных файлов...
if exist "%PROJECT_ROOT%\fitlab\database\seeders\UserSeeder.php" copy /Y "%PROJECT_ROOT%\fitlab\database\seeders\UserSeeder.php" "%BACKUP_DIR%\fitlab\database\seeders\UserSeeder.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\database\seeders\TrainerSeeder.php" copy /Y "%PROJECT_ROOT%\fitlab\database\seeders\TrainerSeeder.php" "%BACKUP_DIR%\fitlab\database\seeders\TrainerSeeder.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\database\seeders\ProductSeeder.php" copy /Y "%PROJECT_ROOT%\fitlab\database\seeders\ProductSeeder.php" "%BACKUP_DIR%\fitlab\database\seeders\ProductSeeder.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\database\seeders\ProgramSeeder.php" copy /Y "%PROJECT_ROOT%\fitlab\database\seeders\ProgramSeeder.php" "%BACKUP_DIR%\fitlab\database\seeders\ProgramSeeder.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\database\seeders\ArticleSeeder.php" copy /Y "%PROJECT_ROOT%\fitlab\database\seeders\ArticleSeeder.php" "%BACKUP_DIR%\fitlab\database\seeders\ArticleSeeder.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\database\seeders\MuscleExerciseSeeder.php" copy /Y "%PROJECT_ROOT%\fitlab\database\seeders\MuscleExerciseSeeder.php" "%BACKUP_DIR%\fitlab\database\seeders\MuscleExerciseSeeder.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\app\Models\User.php" copy /Y "%PROJECT_ROOT%\fitlab\app\Models\User.php" "%BACKUP_DIR%\fitlab\app\Models\User.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\routes\api.php" copy /Y "%PROJECT_ROOT%\fitlab\routes\api.php" "%BACKUP_DIR%\fitlab\routes\api.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\app\Http\Resources\ArticleResource.php" copy /Y "%PROJECT_ROOT%\fitlab\app\Http\Resources\ArticleResource.php" "%BACKUP_DIR%\fitlab\app\Http\Resources\ArticleResource.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\app\Http\Resources\ReviewResource.php" copy /Y "%PROJECT_ROOT%\fitlab\app\Http\Resources\ReviewResource.php" "%BACKUP_DIR%\fitlab\app\Http\Resources\ReviewResource.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\app\Http\Resources\BookingResource.php" copy /Y "%PROJECT_ROOT%\fitlab\app\Http\Resources\BookingResource.php" "%BACKUP_DIR%\fitlab\app\Http\Resources\BookingResource.php.bak" >nul
if exist "%PROJECT_ROOT%\fitlab\app\Http\Resources\TrainerResource.php" copy /Y "%PROJECT_ROOT%\fitlab\app\Http\Resources\TrainerResource.php" "%BACKUP_DIR%\fitlab\app\Http\Resources\TrainerResource.php.bak" >nul
if exist "%PROJECT_ROOT%\my-app\src\components\HomeReviews.jsx" copy /Y "%PROJECT_ROOT%\my-app\src\components\HomeReviews.jsx" "%BACKUP_DIR%\my-app\src\components\HomeReviews.jsx.bak" >nul
if exist "%PROJECT_ROOT%\my-app\src\components\ProductCard.js" copy /Y "%PROJECT_ROOT%\my-app\src\components\ProductCard.js" "%BACKUP_DIR%\my-app\src\components\ProductCard.js.bak" >nul
if exist "%PROJECT_ROOT%\my-app\src\components\home\HomeExperience.jsx" copy /Y "%PROJECT_ROOT%\my-app\src\components\home\HomeExperience.jsx" "%BACKUP_DIR%\my-app\src\components\home\HomeExperience.jsx.bak" >nul

echo [2/6] Копирую файлы во frontend my-app...
xcopy "%SCRIPT_DIR%my-app" "%PROJECT_ROOT%\my-app" /E /I /Y /Q >nul
if errorlevel 1 (
  echo [ERROR] Не удалось скопировать my-app.
  pause
  exit /b 1
)

echo [3/6] Копирую файлы в Laravel fitlab...
xcopy "%SCRIPT_DIR%fitlab" "%PROJECT_ROOT%\fitlab" /E /I /Y /Q >nul
if errorlevel 1 (
  echo [ERROR] Не удалось скопировать fitlab.
  pause
  exit /b 1
)

echo [4/6] Очищаю Laravel cache...
pushd "%PROJECT_ROOT%\fitlab"
php artisan optimize:clear
php artisan config:clear

echo [5/6] Запускаю миграции...
php artisan migrate --force
if errorlevel 1 (
  echo.
  echo [ERROR] Миграции не выполнились.
  echo Проверьте .env и подключение к базе.
  popd
  pause
  exit /b 1
)

echo [6/6] Запускаю сидеры с медиа...
php artisan db:seed --class=UserSeeder --force
if errorlevel 1 goto seed_error
php artisan db:seed --class=TrainerSeeder --force
if errorlevel 1 goto seed_error
php artisan db:seed --class=ProductSeeder --force
if errorlevel 1 goto seed_error
php artisan db:seed --class=ProgramSeeder --force
if errorlevel 1 goto seed_error
php artisan db:seed --class=ArticleSeeder --force
if errorlevel 1 goto seed_error
php artisan db:seed --class=MuscleExerciseSeeder --force
if errorlevel 1 (
  echo [WARNING] MuscleExerciseSeeder не выполнился, но медиа-сидеры уже применены.
)

php artisan optimize:clear
popd

echo.
echo ============================================================
echo [OK] STAGE32 применён.
echo ============================================================
echo.
echo Автоматически сделано:
echo - изображения скопированы в my-app/public/seed-images
echo - изображения скопированы в fitlab/public/seed-images
echo - users засидены с avatar_url
echo - 10 тренеров засидены с photo_url и avatar_url
echo - товары засидены с image_url, gallery и variant image_url
echo - программы засидены с image_url
echo - статьи засидены с cover_image_url
echo.
echo Теперь перезапустите серверы:
echo   cd fitlab
echo   php artisan serve
echo.
echo   cd my-app
echo   npm run dev
echo.
pause
exit /b 0

:seed_error
echo.
echo [ERROR] Один из сидеров не выполнился.
echo Проверьте текст ошибки выше. Код и картинки уже скопированы.
popd
pause
exit /b 1
