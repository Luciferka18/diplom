<?php

$routes = __DIR__ . '/../fitlab/routes/api.php';
if (!file_exists($routes)) {
    fwrite(STDERR, "routes/api.php not found\n");
    exit(1);
}

$contents = file_get_contents($routes);

if (!str_contains($contents, 'LocationController')) {
    $contents = str_replace(
        "use App\\Http\\Controllers\\Api\\HomeController;\n",
        "use App\\Http\\Controllers\\Api\\HomeController;\nuse App\\Http\\Controllers\\Api\\LocationController;\n",
        $contents
    );
}

if (!str_contains($contents, "Route::get('/locations'")) {
    $contents = str_replace(
        "Route::get('/home', [HomeController::class, 'index']);\n",
        "Route::get('/home', [HomeController::class, 'index']);\nRoute::get('/locations', [LocationController::class, 'index']);\n",
        $contents
    );
}

file_put_contents($routes, $contents);
echo "Locations route patched\n";
