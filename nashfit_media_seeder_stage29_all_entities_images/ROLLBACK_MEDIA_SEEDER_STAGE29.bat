@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"
set "BACKUP_DIR=%SCRIPT_DIR%backup"

if exist "%BACKUP_DIR%\my-app\src\components\home\HomeExperience.jsx.bak" copy /Y "%BACKUP_DIR%\my-app\src\components\home\HomeExperience.jsx.bak" "%PROJECT_ROOT%\my-app\src\components\home\HomeExperience.jsx" >nul
if exist "%BACKUP_DIR%\fitlab\routes\api.php.bak" copy /Y "%BACKUP_DIR%\fitlab\routes\api.php.bak" "%PROJECT_ROOT%\fitlab\routes\api.php" >nul
if exist "%BACKUP_DIR%\fitlab\database\seeders\DatabaseSeeder.php.bak" copy /Y "%BACKUP_DIR%\fitlab\database\seeders\DatabaseSeeder.php.bak" "%PROJECT_ROOT%\fitlab\database\seeders\DatabaseSeeder.php" >nul
if exist "%BACKUP_DIR%\fitlab\database\seeders\TrainerSeeder.php.bak" copy /Y "%BACKUP_DIR%\fitlab\database\seeders\TrainerSeeder.php.bak" "%PROJECT_ROOT%\fitlab\database\seeders\TrainerSeeder.php" >nul
if exist "%BACKUP_DIR%\fitlab\database\seeders\ProductSeeder.php.bak" copy /Y "%BACKUP_DIR%\fitlab\database\seeders\ProductSeeder.php.bak" "%PROJECT_ROOT%\fitlab\database\seeders\ProductSeeder.php" >nul
if exist "%BACKUP_DIR%\fitlab\database\seeders\ArticleSeeder.php.bak" copy /Y "%BACKUP_DIR%\fitlab\database\seeders\ArticleSeeder.php.bak" "%PROJECT_ROOT%\fitlab\database\seeders\ArticleSeeder.php" >nul
if exist "%BACKUP_DIR%\fitlab\database\seeders\ProgramSeeder.php.bak" copy /Y "%BACKUP_DIR%\fitlab\database\seeders\ProgramSeeder.php.bak" "%PROJECT_ROOT%\fitlab\database\seeders\ProgramSeeder.php" >nul
if exist "%BACKUP_DIR%\fitlab\database\seeders\UserSeeder.php.bak" copy /Y "%BACKUP_DIR%\fitlab\database\seeders\UserSeeder.php.bak" "%PROJECT_ROOT%\fitlab\database\seeders\UserSeeder.php" >nul
if exist "%BACKUP_DIR%\fitlab\app\Models\User.php.bak" copy /Y "%BACKUP_DIR%\fitlab\app\Models\User.php.bak" "%PROJECT_ROOT%\fitlab\app\Models\User.php" >nul

rmdir /S /Q "%PROJECT_ROOT%\my-app\src\components\muscles" 2>nul
rmdir /S /Q "%PROJECT_ROOT%\fitlab\public\seed-images" 2>nul
rmdir /S /Q "%PROJECT_ROOT%\my-app\public\seed-images" 2>nul

del /Q "%PROJECT_ROOT%\fitlab\app\Models\Muscle.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\app\Models\Exercise.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\app\Http\Controllers\Api\MuscleController.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\database\seeders\MuscleExerciseSeeder.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\database\migrations\2026_06_14_000001_create_muscles_table.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\database\migrations\2026_06_14_000002_create_exercises_table.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\database\migrations\2026_06_14_000003_create_exercise_muscle_table.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\database\migrations\2026_06_14_220000_add_avatar_url_to_users_table.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\database\seeders\UserSeeder.php" 2>nul

echo.
echo [OK] Код Media Seeder Stage29 удалён/откачен.
echo.
echo Важно: rollback не удаляет таблицы из базы автоматически, чтобы случайно не потерять данные.
echo Если нужно удалить таблицы вручную, используйте миграции осознанно.
pause
exit /b 0
