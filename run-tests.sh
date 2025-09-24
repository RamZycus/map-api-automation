#!/bin/bash

# MAP API Test Execution Script
# This script demonstrates how to run specific API tests

echo "🚀 MAP API Test Execution Script"
echo "================================"

# Function to display available options
show_options() {
    echo ""
    echo "Available test execution options:"
    echo "1. Run all MAP API tests"
    echo "2. Run flow management tests"
    echo "3. Run agent management tests"
    echo "4. Run error handling tests"
    echo "5. Run complete workflow tests"
    echo "6. Run dynamic data tests"
    echo "7. Run smoke tests"
    echo "8. Run API tests"
    echo "9. Run integration tests"
    echo "10. Run examples"
    echo "11. Run custom tag combination"
    echo "12. Exit"
    echo ""
}

# Function to run tests
run_tests() {
    local test_command=$1
    local description=$2
    
    echo "🧪 Running: $description"
    echo "Command: $test_command"
    echo "----------------------------------------"
    
    eval $test_command
    
    echo ""
    echo "✅ Test execution completed!"
    echo ""
}

# Main menu
while true; do
    show_options
    read -p "Select an option (1-12): " choice
    
    case $choice in
        1)
            run_tests "npm run test:map-api" "All MAP API Tests"
            ;;
        2)
            run_tests "npm run test:flow-management" "Flow Management Tests"
            ;;
        3)
            run_tests "npm run test:agent-management" "Agent Management Tests"
            ;;
        4)
            run_tests "npm run test:error-handling" "Error Handling Tests"
            ;;
        5)
            run_tests "npm run test:complete-workflow" "Complete Workflow Tests"
            ;;
        6)
            run_tests "npm run test:dynamic-data" "Dynamic Data Tests"
            ;;
        7)
            run_tests "npm run test:smoke" "Smoke Tests"
            ;;
        8)
            run_tests "npm run test:api" "API Tests"
            ;;
        9)
            run_tests "npm run test:integration" "Integration Tests"
            ;;
        10)
            run_tests "npm run test:examples" "Example Tests"
            ;;
        11)
            echo "Enter custom tag combination (e.g., @map-api|@flow-management):"
            read -p "Tag: " custom_tag
            run_tests "npx playwright test --grep \"$custom_tag\"" "Custom Tag: $custom_tag"
            ;;
        12)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please select 1-12."
            ;;
    esac
    
    read -p "Press Enter to continue..."
done
