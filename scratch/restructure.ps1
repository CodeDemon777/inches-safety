$ErrorActionPreference = "Stop"

$workspace = "c:\Users\Tivya\Downloads\ecocycle-store-main\ecocycle-store-main"
Set-Location $workspace

# 1. Create frontend directory
if (-not (Test-Path "frontend")) {
    New-Item -ItemType Directory -Path "frontend"
}

# 2. Move files to frontend
$frontendFiles = @(
    "src",
    "public",
    "components.json",
    "eslint.config.js",
    "index.html",
    "postcss.config.js",
    "tailwind.config.ts",
    "tsconfig.app.json",
    "tsconfig.json",
    "tsconfig.node.json",
    "vite.config.ts",
    "vitest.config.ts",
    ".env"
)

foreach ($item in $frontendFiles) {
    if (Test-Path $item) {
        Move-Item -Path $item -Destination "frontend\" -Force
    }
}

Write-Host "Frontend files moved."

# 3. Handle package.json for frontend
# We'll copy the existing one and remove backend dependencies manually in the next step, or just leave it for now and clean up later.
if (Test-Path "package.json") {
    Copy-Item -Path "package.json" -Destination "frontend\package.json"
    Copy-Item -Path "package.json" -Destination "backend\package.json"
}

Write-Host "Package files copied."

# 4. Clean up root
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package.json") {
    Remove-Item -Force "package.json"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

Write-Host "Root cleaned up."
