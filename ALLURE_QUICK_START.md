# 🚀 Allure Reporting Setup - Quick Start Guide

## 📋 What You Need

### Required Folders:
- `allure-results/` - Contains test result JSON files (auto-generated)
- `reports/` - Contains Cucumber JSON results (auto-generated)
- `allure-report/` - Generated report (auto-created)

### Required Files:
- `scripts/generate-proper-allure.ps1` - Generates the report
- `scripts/serve-proper-allure.ps1` - Serves the report
- `tools/generate-allure-report.js` - Converts Cucumber to Allure format
- `start-allure-report.bat` - Windows batch file for easy access

## 🎯 3-Step Process

### Step 1: Run Your Tests
```powershell
# Run any test to generate Allure results
$env:SETUP="QC";$env:TENANT="ZCS";npm run test:tag "@createFlow"
```

### Step 2: Generate Report (Optional - Auto-generated)
```powershell
# Option A: Direct from Allure results (Recommended)
npm run allure:generate

# Option B: From Cucumber JSON
npm run generate:from-cucumber
npm run allure:generate
```

### Step 3: View Report
```powershell
# Option A: Using npm script
npm run allure:serve

# Option B: Using batch file (Windows)
start-allure-report.bat

# Option C: Direct command
npx allure serve ./allure-results
```

## 📊 Available Commands

| Command | Description |
|---------|-------------|
| `npm run allure:generate` | Generate Allure report from results |
| `npm run allure:serve` | Serve Allure report on localhost:12345 |
| `npm run allure:open` | Open existing report |
| `npm run generate:from-cucumber` | Convert Cucumber JSON to Allure format |
| `npm run test:allure` | Generate from Cucumber + Generate report |

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| PowerShell execution error | Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| Allure command not found | Run: `npm install -g allure-commandline` |
| No results found | Check if JSON files are in `allure-results/` directory |
| Port 12345 in use | Change port or kill process using port |
| Path with spaces error | Use the batch file or PowerShell scripts |

## 📁 File Structure After Setup
```
API_Automation/
├── allure-results/          # Your test results (auto-generated)
├── reports/                 # Cucumber JSON results (auto-generated)
├── allure-report/           # Generated report (auto-created)
├── scripts/                 # PowerShell scripts
│   ├── generate-proper-allure.ps1
│   └── serve-proper-allure.ps1
├── tools/                   # Node.js tools
│   └── generate-allure-report.js
├── start-allure-report.bat  # Windows batch file
└── package.json             # Updated with Allure scripts
```

## 🎉 You're Ready!

1. **Run your tests** - They automatically generate Allure results
2. **Generate report** - `npm run allure:generate` (optional, auto-generated)
3. **View report** - `npm run allure:serve` or `start-allure-report.bat`

The Allure report will show:
- ✅ Test execution results
- 📊 Detailed step-by-step execution
- 🔍 Request/Response details
- 📈 Test trends and statistics
- 🏷️ Test categorization by tags
