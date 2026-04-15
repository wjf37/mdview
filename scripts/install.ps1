$ErrorActionPreference = "Stop"

$Binary    = "src-tauri\target\release\mdview.exe"
$InstallDir  = "$env:LOCALAPPDATA\Programs\mdview"
$InstallPath = "$InstallDir\mdview.exe"

if (-not (Test-Path $Binary)) {
    Write-Error "Error: binary not found at $Binary"
    Write-Error "Run 'npm run build:windows' first."
    exit 1
}

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Copy-Item $Binary $InstallPath -Force

# Check whether the install dir is already on the user PATH
$UserPath = [Environment]::GetEnvironmentVariable("PATH", "User") ?? ""
if ($UserPath -notlike "*$InstallDir*") {
    Write-Host ""
    Write-Host "Warning: $InstallDir is not in your PATH."
    Write-Host "Run this command to add it permanently, then restart your terminal:"
    Write-Host ""
    Write-Host "  [Environment]::SetEnvironmentVariable('PATH', `"$UserPath;$InstallDir`", 'User')"
    Write-Host ""
}

Write-Host "mdview installed to $InstallPath"
