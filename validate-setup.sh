#!/bin/bash

# IT Helpdesk Agent Setup Validation Script

echo "🔍 Validating IT Helpdesk M365 Copilot Agent Setup..."
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "appPackage" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

echo "✅ Project directory structure verified"

# Validate OpenAPI spec
echo ""
echo "📋 Validating OpenAPI specification..."
if python3 -c "import yaml; yaml.safe_load(open('openapi.yaml'))" 2>/dev/null; then
    echo "✅ openapi.yaml is valid YAML"
else
    echo "❌ openapi.yaml has syntax errors"
    exit 1
fi

# Validate JSON files
echo ""
echo "📋 Validating JSON configuration files..."
json_valid=true

for file in appPackage/*.json appPackage/adaptiveCards/*.json; do
    if [ -f "$file" ]; then
        if python3 -c "import json; json.load(open('$file'))" 2>/dev/null; then
            echo "✅ $file is valid"
        else
            echo "❌ $file has syntax errors"
            json_valid=false
        fi
    fi
done

if [ "$json_valid" = false ]; then
    exit 1
fi

# Check required files
echo ""
echo "📋 Checking required files..."
required_files=(
    "openapi.yaml"
    "appPackage/declarativeAgent.json"
    "appPackage/instruction.txt"
    "appPackage/ai-plugin.json"
    "appPackage/manifest.json"
    "appPackage/adaptiveCards/listIncidents.json"
    "appPackage/adaptiveCards/getIncidentById.json"
    "appPackage/adaptiveCards/createIncident.json"
    "appPackage/adaptiveCards/updateIncident.json"
    "appPackage/adaptiveCards/closeIncident.json"
    ".env.example"
    "env/.env.dev"
    "m365agents.yml"
)

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    exit 1
fi

# Check for M365 Agent Toolkit CLI
echo ""
echo "🔧 Checking for M365 Agent Toolkit CLI..."
if command -v atk &> /dev/null; then
    atk_version=$(atk --version)
    echo "✅ ATK CLI installed (version $atk_version)"
else
    echo "⚠️  ATK CLI not found. Install with: npm install -g @microsoft/m365agentstoolkit-cli"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Validation Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next Steps:"
echo "1. Update env/.env.dev with your ServiceNow and Azure credentials"
echo "2. Update openapi.yaml with your ServiceNow instance URL"
echo "3. Configure OAuth in ServiceNow (see README.md)"
echo "4. Update SharePoint knowledge base URL in appPackage/declarativeAgent.json"
echo "5. Run: atk preview --env dev"
echo ""
echo "📚 See README.md for detailed setup instructions"
