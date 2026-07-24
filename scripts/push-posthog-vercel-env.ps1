# Push PostHog env vars from local .env to Vercel (Production + Preview)
# Usage (PowerShell):
#   $env:Path = "...node...;" + $env:Path
#   .\scripts\push-posthog-vercel-env.ps1
#
# Requires: `npx vercel login` once, and project linked (or --scope/--project flags).

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$envFile = Join-Path $Root ".env"
if (-not (Test-Path $envFile)) {
  throw ".env not found at $envFile"
}

$key = $null
$hostVal = "https://eu.i.posthog.com"
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*NEXT_PUBLIC_POSTHOG_KEY=(.+)\s*$') {
    $key = $matches[1].Trim().Trim('"').Trim("'")
  }
  if ($_ -match '^\s*NEXT_PUBLIC_POSTHOG_HOST=(.+)\s*$') {
    $hostVal = $matches[1].Trim().Trim('"').Trim("'")
  }
}

if (-not $key -or $key -notmatch '^phc_') {
  throw "NEXT_PUBLIC_POSTHOG_KEY missing or not a project token (expected phc_...)."
}

$scope = "ario-projects"
$project = "karnex"

function Upsert-Env([string]$name, [string]$value, [string]$environment) {
  Write-Host "Setting $name ($environment)..."
  # Remove existing (ignore errors if missing)
  $null = echo "y" | npx vercel env rm $name $environment --yes --scope $scope 2>$null
  $value | npx vercel env add $name $environment --scope $scope --force
}

Upsert-Env "NEXT_PUBLIC_POSTHOG_KEY" $key "production"
Upsert-Env "NEXT_PUBLIC_POSTHOG_KEY" $key "preview"
Upsert-Env "NEXT_PUBLIC_POSTHOG_HOST" $hostVal "production"
Upsert-Env "NEXT_PUBLIC_POSTHOG_HOST" $hostVal "preview"

Write-Host "Done. Redeploy production for the client bundle to pick up NEXT_PUBLIC_* vars."
Write-Host "  npx vercel --prod --scope $scope"
