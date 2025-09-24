# PowerShell script to generate Allure report
Write-Host "Generating Allure Report..." -ForegroundColor Green

# Change to the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "Working directory: $projectRoot" -ForegroundColor Blue

# Check if allure-results exists
if (Test-Path "allure-results") {
    $resultFiles = Get-ChildItem "allure-results" -Filter "*.json"
    Write-Host "Found $($resultFiles.Count) result files" -ForegroundColor Blue
    
    if ($resultFiles.Count -gt 0) {
        # Generate report using npx with proper path handling
        Write-Host "Generating HTML report..." -ForegroundColor Yellow
        
        try {
            & npx allure generate "allure-results" --clean -o "allure-report"
            Write-Host "Allure report generated successfully!" -ForegroundColor Green
            Write-Host "Report location: allure-report" -ForegroundColor Blue
            
            # Check if report was created
            if (Test-Path "allure-report") {
                Write-Host "Report generation completed!" -ForegroundColor Green
            } else {
                Write-Host "Report generation failed - allure-report directory not found" -ForegroundColor Red
            }
        } catch {
            Write-Host "Error generating report: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "No result files found in allure-results" -ForegroundColor Yellow
    }
} else {
    Write-Host "allure-results directory not found" -ForegroundColor Red
}

Write-Host "Script completed" -ForegroundColor Green
