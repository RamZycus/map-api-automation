# Allure Report Generator - PowerShell Script
# This script generates the proper Allure report with dashboard and charts

Write-Host "Generating Proper Allure Report..." -ForegroundColor Green

# Check if allure-results exists
if (-not (Test-Path "allure-results")) {
    Write-Host "Error: allure-results directory not found!" -ForegroundColor Red
    Write-Host "Please run tests first to generate Allure results." -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit 1
}

# Count JSON files
$jsonFiles = Get-ChildItem "allure-results" -Filter "*.json"
Write-Host "Found $($jsonFiles.Count) test result files" -ForegroundColor Cyan

# Generate Allure report using the allure command directly
Write-Host "Generating Allure report..." -ForegroundColor Yellow

try {
    # Use allure command directly with proper path handling
    & npx allure generate "allure-results" --clean -o "allure-report"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Allure report generated successfully!" -ForegroundColor Green
        Write-Host "Report location: allure-report/" -ForegroundColor Cyan
        Write-Host "To view report, run: npm run allure:serve" -ForegroundColor Yellow
    } else {
        Write-Host "Error generating Allure report (Exit code: $LASTEXITCODE)" -ForegroundColor Red
    }
} catch {
    Write-Host "Exception occurred: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "   1. Run: npm run allure:serve" -ForegroundColor White
Write-Host "   2. Open browser to: http://localhost:12345" -ForegroundColor White
