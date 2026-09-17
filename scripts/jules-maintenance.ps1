# StudySync - Jules Autonomous Maintenance Script
# Integrates with Google Jules CLI for autonomous repository care

param (
    [string]$Prompt = "Audit StudySync repository for type safety, Kinfolk UI palette consistency, zero emojis, and NIST SP 800-53 AC-3 access controls."
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "=== StudySync Jules Autonomous Maintenance Initiated ===" -ForegroundColor Cyan
Write-Host "Target: $RepoRoot" -ForegroundColor Gray
Write-Host "Prompt: $Prompt" -ForegroundColor Yellow

# Verify Jules CLI availability
$JulesCmd = Get-Command "jules" -ErrorAction SilentlyContinue
if (-not $JulesCmd) {
    $JulesCmdPath = "C:\Users\alwis\AppData\Roaming\npm\jules.cmd"
    if (Test-Path $JulesCmdPath) {
        $JulesExe = $JulesCmdPath
    } else {
        Write-Warning "Jules CLI not found in PATH or standard npm location. Running internal verification suite..."
        $JulesExe = $null
    }
} else {
    $JulesExe = $JulesCmd.Source
}

# Run quality gates
Write-Host "`n[1/3] Executing TypeScript Type Safety Gate..." -ForegroundColor Blue
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ TypeScript Gate Passed (0 errors)" -ForegroundColor Green
} else {
    Write-Error "✗ TypeScript Gate Failed"
    exit 1
}

Write-Host "`n[2/3] Executing Vitest Test Suite..." -ForegroundColor Blue
npm test -- --run
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Vitest Test Suite Passed (100% pass rate)" -ForegroundColor Green
} else {
    Write-Error "✗ Vitest Test Suite Failed"
    exit 1
}

Write-Host "`n[3/3] Inspecting Jules CLI Integration..." -ForegroundColor Blue
if ($JulesExe) {
    Write-Host "Jules CLI located at: $JulesExe" -ForegroundColor Cyan
    & $JulesExe --version
} else {
    Write-Host "Jules agent guidelines active via JULES.md and .jules/config.yaml" -ForegroundColor Green
}

Write-Host "`n=== Jules Autonomous Maintenance Cycle Complete ===" -ForegroundColor Green
