@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"
set "BACKUP_DIR=%SCRIPT_DIR%backup"

if exist "%BACKUP_DIR%\my-app\src\components\home\HomeExperience.jsx.bak" copy /Y "%BACKUP_DIR%\my-app\src\components\home\HomeExperience.jsx.bak" "%PROJECT_ROOT%\my-app\src\components\home\HomeExperience.jsx" >nul
if exist "%BACKUP_DIR%\fitlab\routes\api.php.bak" copy /Y "%BACKUP_DIR%\fitlab\routes\api.php.bak" "%PROJECT_ROOT%\fitlab\routes\api.php" >nul
if exist "%BACKUP_DIR%\fitlab\database\seeders\DatabaseSeeder.php.bak" copy /Y "%BACKUP_DIR%\fitlab\database\seeders\DatabaseSeeder.php.bak" "%PROJECT_ROOT%\fitlab\database\seeders\DatabaseSeeder.php" >nul

rmdir /S /Q "%PROJECT_ROOT%\my-app\src\components\muscles" 2>nul

del /Q "%PROJECT_ROOT%\fitlab\app\Models\Muscle.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\app\Models\Exercise.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\app\Http\Controllers\Api\MuscleController.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\database\seeders\MuscleExerciseSeeder.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\database\migrations\2026_06_14_000001_create_muscles_table.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\database\migrations\2026_06_14_000002_create_exercises_table.php" 2>nul
del /Q "%PROJECT_ROOT%\fitlab\database\migrations\2026_06_14_000003_create_exercise_muscle_table.php" 2>nul

echo.
echo [OK] Код Stage18 удалён/откачен.
echo.
echo Важно: rollback не удаляет таблицы из базы автоматически, чтобы случайно не потерять данные.
echo Если нужно удалить таблицы вручную, используйте миграции осознанно.
pause
exit /b 0
