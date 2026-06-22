$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$backendScript = Join-Path $PSScriptRoot "backend\run_backend.ps1"
$frontendScript = Join-Path $PSScriptRoot "frontend\run_frontend.ps1"

function Stop-PortProcess {
    param([int[]] $Ports)

    $netstat = netstat -ano
    foreach ($port in $Ports) {
        $listeners = $netstat | Select-String "(\d+\.\d+\.\d+\.\d+|0\.0\.0\.0|\[::\]|127\.0\.0\.1):$port\s+.*LISTENING\s+(\d+)"
        foreach ($listener in $listeners) {
            $processId = [int]$listener.Matches[0].Groups[2].Value
            if ($processId -gt 0) {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

function Get-LanUrl {
    $address = (ipconfig | Select-String "IPv4 Address|IPv4.*:" |
        ForEach-Object { ($_ -split ":\s*", 2)[1].Trim() } |
        Where-Object { $_ -and $_ -notlike "127.*" -and $_ -notlike "169.254.*" } |
        Select-Object -First 1)

    if ($address) {
        return "http://${address}:5173"
    }

    return $null
}

if (-not (Test-Path $backendScript)) {
    throw "Backend startup script was not found at $backendScript"
}

if (-not (Test-Path $frontendScript)) {
    throw "Frontend startup script was not found at $frontendScript"
}

Write-Host "Cleaning old Project A servers..."
Stop-PortProcess -Ports @(8000, 5173, 5174, 5175)
Start-Sleep -Seconds 2

Write-Host "Starting Segmify.ai backend on http://0.0.0.0:8000"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$backendScript`""

Write-Host "Starting Segmify.ai frontend on http://0.0.0.0:5173"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$frontendScript`""

Start-Sleep -Seconds 5
Start-Process "http://127.0.0.1:5173"

$lanUrl = Get-LanUrl
Write-Host ""
Write-Host "Open on this computer: http://127.0.0.1:5173"
if ($lanUrl) {
    Write-Host "Open on other devices on the same Wi-Fi/LAN: $lanUrl"
}
Write-Host ""
Write-Host "Default login:"
Write-Host "  Email: admin@segmify.ai"
Write-Host "  Password: Admin@123"
