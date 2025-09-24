#!/bin/bash
# run-tag.sh - Run Playwright tests with specific tags

if [ $# -eq 0 ]; then
    echo "Usage: ./run-tag.sh <tag>"
    echo "Example: ./run-tag.sh @testCreateFlow"
    echo "Example: ./run-tag.sh @testCreateFlow @testCreateAgent"
    exit 1
fi

# Join all arguments with spaces
TAGS="$*"

echo "Running tests with tags: $TAGS"
npx playwright test --project=gherkin-tests --grep "$TAGS"
