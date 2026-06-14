@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"
set "BACKUP_DIR=%SCRIPT_DIR%backup_stage34"

echo.
echo ============================================================
echo ROLLBACK STAGE34
echo ============================================================
echo.

if exist "%BACKUP_DIR%\fitlab\database\seeders\UserSeeder.php.bak" copy /Y "%BACKUP_DIR%\fitlab\database\seeders\UserSeeder.php.bak" "%PROJECT_ROOT%\fitlab\database\seeders\UserSeeder.php" >nul
if exist "%BACKUP_DIR%\fitlab\database\seeders\TrainerSeeder.php.bak" copy /Y "%BACKUP_DIR%\fitlab\database\seeders\TrainerSeeder.php.bak" "%PROJECT_ROOT%\fitlab\database\seeders\TrainerSeeder.php" >nul
if exist "%BACKUP_DIR%\fitlab\database\seeders\ProductSeeder.php.bak" copy /Y "%BACKUP_DIR%\fitlab\database\seeders\ProductSeeder.php.bak" "%PROJECT_ROOT%\fitlab\database\seeders\ProductSeeder.php" >nul
if exist "%BACKUP_DIR%\fitlab\database\seeders\ProgramSeeder.php.bak" copy /Y "%BACKUP_DIR%\fitlab\database\seeders\ProgramSeeder.php.bak" "%PROJECT_ROOT%\fitlab\database\seeders\ProgramSeeder.php" >nul
if exist "%BACKUP_DIR%\fitlab\database\seeders\ArticleSeeder.php.bak" copy /Y "%BACKUP_DIR%\fitlab\database\seeders\ArticleSeeder.php.bak" "%PROJECT_ROOT%\fitlab\database\seeders\ArticleSeeder.php" >nul
if exist "%BACKUP_DIR%\fitlab\database\seeders\MuscleExerciseSeeder.php.bak" copy /Y "%BACKUP_DIR%\fitlab\database\seeders\MuscleExerciseSeeder.php.bak" "%PROJECT_ROOT%\fitlab\database\seeders\MuscleExerciseSeeder.php" >nul
if exist "%BACKUP_DIR%\fitlab\app\Models\User.php.bak" copy /Y "%BACKUP_DIR%\fitlab\app\Models\User.php.bak" "%PROJECT_ROOT%\fitlab\app\Models\User.php" >nul
if exist "%BACKUP_DIR%\fitlab\routes\api.php.bak" copy /Y "%BACKUP_DIR%\fitlab\routes\api.php.bak" "%PROJECT_ROOT%\fitlab\routes\api.php" >nul
if exist "%BACKUP_DIR%\fitlab\app\Http\Resources\ArticleResource.php.bak" copy /Y "%BACKUP_DIR%\fitlab\app\Http\Resources\ArticleResource.php.bak" "%PROJECT_ROOT%\fitlab\app\Http\Resources\ArticleResource.php" >nul
if exist "%BACKUP_DIR%\fitlab\app\Http\Resources\ReviewResource.php.bak" copy /Y "%BACKUP_DIR%\fitlab\app\Http\Resources\ReviewResource.php.bak" "%PROJECT_ROOT%\fitlab\app\Http\Resources\ReviewResource.php" >nul
if exist "%BACKUP_DIR%\fitlab\app\Http\Resources\BookingResource.php.bak" copy /Y "%BACKUP_DIR%\fitlab\app\Http\Resources\BookingResource.php.bak" "%PROJECT_ROOT%\fitlab\app\Http\Resources\BookingResource.php" >nul
if exist "%BACKUP_DIR%\fitlab\app\Http\Resources\TrainerResource.php.bak" copy /Y "%BACKUP_DIR%\fitlab\app\Http\Resources\TrainerResource.php.bak" "%PROJECT_ROOT%\fitlab\app\Http\Resources\TrainerResource.php" >nul
if exist "%BACKUP_DIR%\my-app\src\components\HomeReviews.jsx.bak" copy /Y "%BACKUP_DIR%\my-app\src\components\HomeReviews.jsx.bak" "%PROJECT_ROOT%\my-app\src\components\HomeReviews.jsx" >nul
if exist "%BACKUP_DIR%\my-app\src\components\ProductCard.js.bak" copy /Y "%BACKUP_DIR%\my-app\src\components\ProductCard.js.bak" "%PROJECT_ROOT%\my-app\src\components\ProductCard.js" >nul
if exist "%BACKUP_DIR%\my-app\src\components\home\HomeExperience.jsx.bak" copy /Y "%BACKUP_DIR%\my-app\src\components\home\HomeExperience.jsx.bak" "%PROJECT_ROOT%\my-app\src\components\home\HomeExperience.jsx" >nul

rmdir /S /Q "%PROJECT_ROOT%\fitlab\public\seed-images" 2>nul
rmdir /S /Q "%PROJECT_ROOT%\my-app\public\seed-images" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\database\migrations\2026_06_14_220000_add_avatar_url_to_users_table.php" 2>nul

echo.
echo [OK] STAGE34 files rolled back.
echo Database records were not deleted.
echo.
pause
exit /b 0
