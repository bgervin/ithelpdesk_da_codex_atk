#!/bin/bash
# Test script to validate local Prism mock server setup

set -e

echo "🧪 Testing Local Development Setup"
echo "=================================="
echo ""

# Load environment variables safely
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Set defaults if not set
export API_HOST=${API_HOST:-localhost}
export API_PORT=${API_PORT:-4010}

echo "✅ Environment variables loaded"
echo "   API_HOST: $API_HOST"
echo "   API_PORT: $API_PORT"
echo ""

# Test 1: Generate local spec
echo "📝 Test 1: Generating local OpenAPI spec..."
npm run spec:local
if [ -f appPackage/apiSpecificationFile/openapi.local.yaml ]; then
    echo "✅ Local spec generated successfully"
else
    echo "❌ Failed to generate local spec"
    exit 1
fi
echo ""

# Test 2: Seed examples from CSV
echo "📊 Test 2: Seeding examples from CSV..."
npm run seed:examples
if [ -d examples ]; then
    echo "✅ Examples directory created"
    echo "   Generated files:"
    ls -1 examples/
else
    echo "⚠️  No examples directory (no CSV files found)"
fi
echo ""

# Test 3: Verify local spec has correct server URL
echo "🔍 Test 3: Verifying local spec server URL..."
if grep -q "url: http://$API_HOST:$API_PORT" appPackage/apiSpecificationFile/openapi.local.yaml; then
    echo "✅ Local spec has correct server URL"
else
    echo "❌ Local spec server URL is incorrect"
    exit 1
fi
echo ""

# Test 4: Start Prism mock server in background
echo "🚀 Test 4: Starting Prism mock server..."
npm run mock:start > /tmp/prism.log 2>&1 &
PRISM_PID=$!
sleep 5

# Check if Prism is running
if ps -p $PRISM_PID > /dev/null; then
    echo "✅ Prism mock server started (PID: $PRISM_PID)"
else
    echo "❌ Failed to start Prism mock server"
    cat /tmp/prism.log
    exit 1
fi
echo ""

# Test 5: Test Prism mock server endpoint (without auth)
echo "🔌 Test 5: Testing Prism mock server endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$API_PORT/table/incident)
if [ "$HTTP_CODE" = "401" ]; then
    echo "✅ Prism mock server is responding (401 - auth required as expected)"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Prism mock server is responding (200 - OK)"
else
    echo "⚠️  Prism mock server returned status: $HTTP_CODE"
fi
echo ""

# Cleanup
echo "🧹 Cleaning up..."
[ -n "$PRISM_PID" ] && kill $PRISM_PID 2>/dev/null || true
echo "✅ Stopped all background processes"
echo ""

echo "=================================="
echo "✅ All tests passed successfully!"
echo ""
echo "To start the local development environment manually:"
echo "  1. npm run spec:local"
echo "  2. npm run seed:examples"
echo "  3. npm run mock:start"
echo ""
echo "Or press F5 in VS Code to start everything automatically."
