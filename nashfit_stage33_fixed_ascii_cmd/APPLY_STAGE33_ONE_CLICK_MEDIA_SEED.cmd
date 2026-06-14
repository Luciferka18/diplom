@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"
set "BACKUP_DIR=%SCRIPT_DIR%backup_stage33"

echo.
echo ============================================================
echo NASHFIT STAGE33 - ONE CLICK MEDIA SEED
echo ============================================================
echo.

if not exist "%PROJECT_ROOT%\my-app" (
  echo [ERROR] Folder my-app not found.
  echo Extract nashfit_stage33_fixed_ascii_cmd into project root next to my-app and fitlab.
  pause
  exit /b 1
)

if not exist "%PROJECT_ROOT%\fitlab" (
  echo [ERROR] Folder fitlab not found.
  echo Extract nashfit_stage33_fixed_ascii_cmd into project root next to my-app and fitlab.
  pause
  exit /b 1
)

where php >nul 2>nul
if errorlevel 1 (
  echo [ERROR] PHP not found in PATH.
  echo Open terminal where php artisan works, then run this file again.
  pause
  exit /b 1
)

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%BACKUP_DIR%\fitlab" mkdir "%BACKUP_DIR%\fitlab"
if not exist "%BACKUP_DIR%\fitlab\database" mkdir "%BACKUP_DIR%\fitlab\database"
if not exist "%BACKUP_DIR%\fitlab\database\seeders" mkdir "%BACKUP_DIR%\fitlab\database\seeders"
if not exist "%BACKUP_DIR%\fitlab\app" mkdir "%BACKUP_DIR%\fitlab\app"
if not exist "%BACKUP_DIR%\fitlab\app\Models" mkdir "%BACKUP_DIR%\fitlab\app\Models"
if not exist "%BACKUP_DIR%\fitlab\app\Http" mkdir "%BACKUP_DIR%\fitlab\app\Http"
if not exist "%BACKUP_DIR%\fitlab\app\Http\Resources" mkdir "%BACKUP_DIR%\fitlab\app\Http\Resources"
if not exist "%BACKUP_DIR%\fitlab\routes" mkdir "%BACKUP_DIR%\fitlab\routes"
if not exist "%BACKUP_DIR%\my-app" mkdir "%BACKUP_DIR%\my-app"
if not exist "%BACKUP_DIR%\my-app\src" mkdir "%BACKUP_DIR%\my-app\src"
if not exist "%BACKUP_DIR%\my-app\src\components" mkdir "%BACKUP_DIR%\my-app\src\components"
if not exist "%BACKUP_DIR%\my-app\src\components\home" mkdir "%BACKUP_DIR%\my-app\src\components\home"

echo [1/6] Backup files...
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

echo [2/6] Copy frontend files...
xcopy "%SCRIPT_DIR%my-app" "%PROJECT_ROOT%\my-app" /E /I /Y /Q >nul
if errorlevel 1 (
  echo [ERROR] Failed to copy my-app.
  pause
  exit /b 1
)

echo [3/6] Copy backend files...
xcopy "%SCRIPT_DIR%fitlab" "%PROJECT_ROOT%\fitlab" /E /I /Y /Q >nul
if errorlevel 1 (
  echo [ERROR] Failed to copy fitlab.
  pause
  exit /b 1
)

echo [4/6] Clear Laravel cache...
pushd "%PROJECT_ROOT%\fitlab"
php artisan optimize:clear
php artisan config:clear

echo [5/6] Run migrations...
php artisan migrate --force
if errorlevel 1 (
  echo.
  echo [ERROR] Migrations failed. Check .env database settings.
  popd
  pause
  exit /b 1
)

echo [6/6] Run seeders...
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
  echo [WARNING] MuscleExerciseSeeder failed, media seeders were already applied.
)

php artisan optimize:clear
popd

echo.
echo ============================================================
echo [OK] STAGE33 APPLIED
echo ============================================================
echo.
echo Done:
echo - images copied to my-app/public/seed-images
echo - images copied to fitlab/public/seed-images
echo - users seeded with avatar_url
echo - trainers seeded with photo_url and avatar_url
echo - products seeded with image_url, gallery and variant image_url
echo - programs seeded with image_url
echo - articles seeded with cover_image_url
echo.
echo Restart servers:
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
echo [ERROR] Seeder failed. Read the error above.
echo Files and images were already copied.
popd
pause
exit /b 1
