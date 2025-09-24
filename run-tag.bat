@echo off
REM run-tag.bat - Run Playwright tests with specific tags

if "%1"=="" (
    echo Usage: run-tag.bat ^<tag^>
    echo Example: run-tag.bat @testCreateFlow
    echo Example: run-tag.bat @testCreateFlow @testCreateAgent
    exit /b 1
)

echo Running tests with tags: %*
npx playwright test --project=gherkin-tests --grep "%*"
