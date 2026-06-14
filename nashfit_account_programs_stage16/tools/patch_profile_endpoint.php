<?php

$root = realpath(__DIR__ . '/../../fitlab');
if (!$root) {
    fwrite(STDERR, "Cannot find ../fitlab from patch folder. Run this from D:\\diplom\\nashfit_account_programs_stage16.\n");
    exit(1);
}

$authPath = $root . DIRECTORY_SEPARATOR . 'app/Http/Controllers/Api/AuthController.php';
$routesPath = $root . DIRECTORY_SEPARATOR . 'routes/api.php';

if (!is_file($authPath) || !is_file($routesPath)) {
    fwrite(STDERR, "AuthController.php or routes/api.php not found.\n");
    exit(1);
}

$auth = file_get_contents($authPath);

if (strpos($auth, 'Illuminate\\Validation\\Rule') === false) {
    $auth = str_replace(
        "use Illuminate\\Support\\Facades\\Hash;\n",
        "use Illuminate\\Support\\Facades\\Hash;\nuse Illuminate\\Validation\\Rule;\n",
        $auth
    );
}

if (strpos($auth, 'function updateProfile(') === false) {
    $method = <<<'PHP_METHOD'

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'login' => ['required', 'string', 'min:6', 'alpha_num', Rule::unique('users', 'login')->ignore($user->id)],
            'name' => ['required', 'string', 'max:255', 'regex:/^[А-Яа-яЁё\s-]+$/u'],
            'phone' => ['required', 'string', 'regex:/^\+7\d{10}$/', Rule::unique('users', 'phone')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        $user->forceFill($data)->save();

        return response()->json([
            'message' => 'Профиль обновлён.',
            'user' => new UserResource($user->fresh()),
        ]);
    }
PHP_METHOD;

    $needle = "\n    public function logout(Request " . '$request' . ")";
    if (strpos($auth, $needle) !== false) {
        $auth = str_replace($needle, $method . $needle, $auth);
    } else {
        $auth = preg_replace('/\n}\s*$/', $method . "\n}\n", $auth);
    }
}

file_put_contents($authPath, $auth);

$routes = file_get_contents($routesPath);
if (strpos($routes, "/auth/profile") === false) {
    $line = "    Route::get('/auth/me', [AuthController::class, 'me']);";
    if (strpos($routes, $line) !== false) {
        $routes = str_replace($line, $line . "\n    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);", $routes);
    } else {
        $routes = str_replace("Route::middleware('auth:sanctum')->group(function () {", "Route::middleware('auth:sanctum')->group(function () {\n    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);", $routes);
    }
}
file_put_contents($routesPath, $routes);

echo "Profile endpoint patched successfully.\n";
