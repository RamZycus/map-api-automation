# Allure Serve Script - Handles paths with spaces properly
Write-Host "🚀 Starting Allure Report Server..." -ForegroundColor Green
Write-Host ""

# Check if allure-results exists
if (-not (Test-Path "allure-results")) {
    Write-Host "❌ Error: allure-results directory not found!" -ForegroundColor Red
    Write-Host "💡 Please run tests first to generate Allure results." -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit 1
}

# Count JSON files
$jsonFiles = Get-ChildItem "allure-results" -Filter "*.json" -ErrorAction SilentlyContinue
Write-Host "📊 Found $($jsonFiles.Count) test result files" -ForegroundColor Cyan

Write-Host ""
Write-Host "🌐 Starting Allure server on http://localhost:12345..." -ForegroundColor Green
Write-Host "📱 Browser will open automatically..." -ForegroundColor Cyan
Write-Host ""

try {
    # Use Start-Process to handle paths with spaces properly
    $process = Start-Process -FilePath "npx" -ArgumentList "allure", "serve", "allure-results" -PassThru -Wait
    
    Write-Host "✅ Allure report server started!" -ForegroundColor Green
    Write-Host "📱 Open your browser to the URL shown above" -ForegroundColor White
    Write-Host "📊 You'll see detailed test execution reports" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Press Ctrl+C to stop the server" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Exception occurred: $($_.Exception.Message)" -ForegroundColor Red
}

Read-Host "Press Enter to continue"
