$mysqldump = "D:\ospanel\modules\database\MySQL-8.0-Win10\bin\mysqldump.exe"

$dbName = "fitlab"
$dbUser = "root"
$dbPassword = ""

$outDir = "D:\diplom\backup"
$outFile = Join-Path $outDir "$dbName.sql"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$argsList = @(
    "-u", $dbUser,
    "--default-character-set=utf8mb4",
    "--single-transaction",
    "--routines",
    "--triggers",
    "--events",
    "--result-file=$outFile",
    $dbName
)

if ($dbPassword -ne "") {
    $argsList = @("-u", $dbUser, "-p$dbPassword") + $argsList[2..($argsList.Count - 1)]
}

& $mysqldump @argsList

Write-Host "Done: $outFile"