# Allure Serve - PowerShell Script for Proper Allure Report
# This script serves the proper Allure report with dashboard

Write-Host "Starting Allure Server..." -ForegroundColor Green

# Check if allure-results exists
if (-not (Test-Path "allure-results")) {
    Write-Host "Error: allure-results directory not found!" -ForegroundColor Red
    Write-Host "Please run: npm run allure:generate first" -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "Results directory: allure-results" -ForegroundColor Yellow
Write-Host "Starting Allure server on http://localhost:12345..." -ForegroundColor Green
Write-Host "Browser will open automatically..." -ForegroundColor Cyan

try {
    # Use allure serve command directly with proper path handling
    $allureCmd = "npx"
    $allureArgs = @("allure", "serve", "allure-results")
    
    Write-Host "Executing: $allureCmd $($allureArgs -join ' ')" -ForegroundColor Cyan
    
    & $allureCmd $allureArgs
    
    Write-Host "Allure server started!" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    
} catch {
    Write-Host "Exception occurred: $($_.Exception.Message)" -ForegroundColor Red
}
