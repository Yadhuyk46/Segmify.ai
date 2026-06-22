$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Resolve-Python {
    $localPython = Join-Path $env:LOCALAPPDATA "Programs\Python\Python313\python.exe"
    foreach ($candidate in @("python", "py", $localPython)) {
        $command = Get-Command $candidate -ErrorAction SilentlyContinue
        if ($command) {
            try {
                & $command.Source --version *> $null
                if ($LASTEXITCODE -eq 0) {
                    return $command.Source
                }
            } catch {
            }
        }
    }
    return $null
}

$python = Resolve-Python
if (-not $python) {
    throw "Python was not found. Install Python 3.13+ or run the Docker setup with: docker compose up --build"
}

& $python -m pip install --prefer-binary --timeout 30 --retries 2 -i https://pypi.org/simple -r requirements.txt
& $python seed.py
& $python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
