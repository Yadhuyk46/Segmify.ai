$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$nodePath = "C:\Program Files\nodejs"
if (Test-Path $nodePath) {
    $env:Path = "$nodePath;" + $env:Path
}

$node = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $node) {
    $node = Get-Command node -ErrorAction SilentlyContinue
}

$npm = Get-Command npm.cmd -ErrorAction SilentlyContinue

if (-not $node) {
    throw "Node.js was not found. Install Node.js 22+ or run the Docker setup with: docker compose up --build"
}

if (-not (Test-Path "node_modules")) {
    if (-not $npm) {
        throw "npm was not found and node_modules is missing. Install Node.js 22+ or run npm install manually."
    }
    & $npm.Source install
}

$vite = Join-Path $PSScriptRoot "node_modules\vite\bin\vite.js"
if (-not (Test-Path $vite)) {
    throw "Vite was not found at $vite. Run npm install in the frontend folder."
}

& $node.Source $vite --host 0.0.0.0 --port 5173 --strictPort
