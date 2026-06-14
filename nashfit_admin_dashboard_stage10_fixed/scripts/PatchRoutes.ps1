param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRoot
)

$routesPath = Join-Path $ProjectRoot "routes\api.php"
if (!(Test-Path $routesPath)) {
  Write-Host "[ERROR] routes/api.php not found: $routesPath" -ForegroundColor Red
  exit 1
}

$content = Get-Content $routesPath -Raw

$useLine = "use App\Http\Controllers\Api\AdminDashboardController;"
if ($content -notmatch [regex]::Escape($useLine)) {
  if ($content -match "use App\\Http\\Controllers\\Api\\AdminController;") {
    $content = $content -replace "use App\\Http\\Controllers\\Api\\AdminController;", "use App\Http\Controllers\Api\AdminController;`r`n$useLine"
  } else {
    $content = $content -replace "<\?php\s*", "<?php`r`n`r`n$useLine`r`n"
  }
}

$routeLine = "        Route::get('/admin/dashboard/overview', [AdminDashboardController::class, 'overview']);"
if ($content -notmatch [regex]::Escape("/admin/dashboard/overview")) {
  $anchor = "        Route::get('/admin/{entity}', [AdminController::class, 'index']);"
  if ($content.Contains($anchor)) {
    $content = $content.Replace($anchor, $routeLine + "`r`n" + $anchor)
  } else {
    $anchor2 = "    Route::middleware('role:admin')->group(function () {"
    $idx = $content.LastIndexOf($anchor2)
    if ($idx -ge 0) {
      $insertAt = $content.IndexOf("`n", $idx)
      $content = $content.Insert($insertAt + 1, $routeLine + "`r`n")
    } else {
      Write-Host "[WARN] Could not find admin route group. Route was not inserted." -ForegroundColor Yellow
    }
  }
}

Set-Content -Path $routesPath -Value $content -Encoding UTF8
Write-Host "[OK] routes/api.php patched for admin dashboard overview"
