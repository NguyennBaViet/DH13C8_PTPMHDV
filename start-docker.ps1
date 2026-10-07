param()

Write-Host "Starting Mois Hotel Docker Services..."
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Find docker executable
$dockerPath = ""
$dockerComposePath = ""

# Common Docker Desktop paths
$possiblePaths = @(
    "C:\Program Files\Docker\Docker\resources\bin",
    "C:\Program Files (x86)\Docker\Docker\resources\bin",
    "$env:ProgramFiles\Docker\Docker\resources\bin"
)

foreach ($path in $possiblePaths) {
    if (Test-Path "$path\docker.exe") {
        $dockerPath = "$path\docker.exe"
        $dockerComposePath = "$path\docker-compose.exe"
        Write-Host "Found Docker at: $dockerPath"
        break
    }
}

if ($dockerPath -eq "") {
    Write-Host "ERROR: Docker not found in PATH or common locations" -ForegroundColor Red
    Write-Host "Please ensure Docker Desktop is installed and started" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Start Docker Desktop from Windows Start menu" -ForegroundColor White
    Write-Host "2. Wait 30 seconds for Docker daemon to start" -ForegroundColor White
    Write-Host "3. Close this PowerShell window" -ForegroundColor White
    Write-Host "4. Open a NEW PowerShell window" -ForegroundColor White
    Write-Host "5. Run this script again" -ForegroundColor White
    exit 1
}

Write-Host "Checking Docker version..."
& $dockerPath --version

Write-Host ""
Write-Host "Starting all services..."
& $dockerComposePath up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start services" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Services starting... waiting 30 seconds..."
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "Service Status:"
& $dockerComposePath ps

Write-Host ""
Write-Host "Access Points:"
Write-Host "  Frontend:   http://localhost:5173"
Write-Host "  API Gateway: http://localhost:8020"
Write-Host ""
Write-Host "Done! Services are running."
