@echo off
setlocal enabledelayedexpansion

REM MAP API Test Execution Script for Windows
REM This script demonstrates how to run specific API tests

echo 🚀 MAP API Test Execution Script
echo ================================

:menu
echo.
echo Available test execution options:
echo 1. Run all MAP API tests
echo 2. Run flow management tests
echo 3. Run agent management tests
echo 4. Run error handling tests
echo 5. Run complete workflow tests
echo 6. Run dynamic data tests
echo 7. Run smoke tests
echo 8. Run API tests
echo 9. Run integration tests
echo 10. Run examples
echo 11. Run custom tag combination
echo 12. Exit
echo.

set /p choice="Select an option (1-12): "

if "%choice%"=="1" (
    call :run_test "npm run test:map-api" "All MAP API Tests"
    goto :menu
)
if "%choice%"=="2" (
    call :run_test "npm run test:flow-management" "Flow Management Tests"
    goto :menu
)
if "%choice%"=="3" (
    call :run_test "npm run test:agent-management" "Agent Management Tests"
    goto :menu
)
if "%choice%"=="4" (
    call :run_test "npm run test:error-handling" "Error Handling Tests"
    goto :menu
)
if "%choice%"=="5" (
    call :run_test "npm run test:complete-workflow" "Complete Workflow Tests"
    goto :menu
)
if "%choice%"=="6" (
    call :run_test "npm run test:dynamic-data" "Dynamic Data Tests"
    goto :menu
)
if "%choice%"=="7" (
    call :run_test "npm run test:smoke" "Smoke Tests"
    goto :menu
)
if "%choice%"=="8" (
    call :run_test "npm run test:api" "API Tests"
    goto :menu
)
if "%choice%"=="9" (
    call :run_test "npm run test:integration" "Integration Tests"
    goto :menu
)
if "%choice%"=="10" (
    call :run_test "npm run test:examples" "Example Tests"
    goto :menu
)
if "%choice%"=="11" (
    set /p custom_tag="Enter custom tag combination (e.g., @map-api^|@flow-management): "
    call :run_test "npx playwright test --grep \"!custom_tag!\"" "Custom Tag: !custom_tag!"
    goto :menu
)
if "%choice%"=="12" (
    echo 👋 Goodbye!
    exit /b 0
)

echo ❌ Invalid option. Please select 1-12.
pause
goto :menu

:run_test
set test_command=%~1
set description=%~2

echo 🧪 Running: %description%
echo Command: %test_command%
echo ----------------------------------------

%test_command%

echo.
echo ✅ Test execution completed!
echo.
pause
goto :eof
