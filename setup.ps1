$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host " NITOGEN - SIH 2026 SETUP"
Write-Host "========================================"

# 1. Check Docker
Write-Host "`n[1/4] Checking Docker..."

try {
    docker --version

    if ($LASTEXITCODE -ne 0) {
        throw "Docker command failed."
    }
}
catch {
    Write-Host "Docker Desktop is required. Please install/start Docker Desktop."
    exit 1
}

# 2. Check / Setup LM Studio CLI
Write-Host "`n[2/4] Checking LM Studio..."

$lmsRoot = Join-Path $env:LOCALAPPDATA "Programs\LM Studio"
$lmsExe = $null

# Search for existing lms.exe
if (Test-Path $lmsRoot) {

    $lmsExe = Get-ChildItem $lmsRoot `
        -Recurse `
        -Filter "lms.exe" `
        -ErrorAction SilentlyContinue |
        Select-Object -First 1
}

# If lms.exe is not found, install LM Studio
if ($null -eq $lmsExe) {

    Write-Host "LM Studio CLI not found. Installing LM Studio..."

    winget install --id ElementLabs.LMStudio -e `
        --accept-package-agreements `
        --accept-source-agreements

    Start-Sleep -Seconds 3

    if (Test-Path $lmsRoot) {

        $lmsExe = Get-ChildItem $lmsRoot `
            -Recurse `
            -Filter "lms.exe" `
            -ErrorAction SilentlyContinue |
            Select-Object -First 1
    }
}

# Final check
if ($null -eq $lmsExe) {

    Write-Host ""
    Write-Host "ERROR: lms.exe could not be found."
    Write-Host "Please open LM Studio once and run this script again."
    exit 1
}

$lmsDir = $lmsExe.DirectoryName
$lmsFullPath = $lmsExe.FullName

Write-Host "LM Studio CLI found:"
Write-Host "  $lmsFullPath"

# Add to current PowerShell PATH
if (($env:Path -split ';') -notcontains $lmsDir) {

    $env:Path += ";$lmsDir"
}

# Permanently add to User PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ([string]::IsNullOrWhiteSpace($userPath)) {
    $userPath = ""
}

if (($userPath -split ';') -notcontains $lmsDir) {

    if ([string]::IsNullOrWhiteSpace($userPath)) {

        $newUserPath = $lmsDir

    }
    else {

        $newUserPath = "$userPath;$lmsDir"
    }

    [Environment]::SetEnvironmentVariable(
        "Path",
        $newUserPath,
        "User"
    )

    Write-Host "LM Studio CLI added to User PATH."
}

# Verify LMS
if (-not (Get-Command lms -ErrorAction SilentlyContinue)) {

    Write-Host "ERROR: 'lms' is still unavailable."
    Write-Host "Close PowerShell, open a new PowerShell window, and run this script again."
    exit 1
}

Write-Host "LM Studio CLI is ready."

# 3. Start LM Studio server and download/load models
Write-Host "`n[3/4] Starting LM Studio..."

try {

    lms server start

}
catch {

    Write-Host "Could not start LM Studio server."
    Write-Host $_.Exception.Message
    exit 1
}

Start-Sleep -Seconds 5

Write-Host "`nDownloading Gemma 3 4B..."

lms get gemma-3-4b

Write-Host "`nDownloading Qwen2.5-VL 7B..."

lms get qwen2.5-vl-7b

Write-Host "`nAI models ready."

# Show downloaded models
Write-Host "`nAvailable local models:"

lms ls

# Load Gemma
Write-Host "`nLoading Gemma 3 4B..."

lms load gemma-3-4b

# Load Qwen
Write-Host "`nLoading Qwen2.5-VL 7B..."

lms load qwen2.5-vl-7b

# Show loaded models
Write-Host "`nLoaded models:"

lms ps

# 4. Start NITOGEN with Docker Compose
Write-Host "`n[4/4] Starting NITOGEN..."

if (
    -not (Test-Path ".\docker-compose.yml") -and
    -not (Test-Path ".\compose.yml")
) {

    Write-Host "WARNING: docker-compose.yml / compose.yml was not found in:"
    Write-Host (Get-Location)

    Write-Host "Make sure you are running setup.ps1 from the NITOGEN project folder."

    exit 1
}

docker compose up --build