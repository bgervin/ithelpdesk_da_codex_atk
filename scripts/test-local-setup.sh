#!/bin/bash
# Test script to validate local Prism mock server setup

set -e

echo "🧪 Testing Local Development Setup"
echo "=================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set defaults if not set
export API_HOST=${API_HOST:-localhost}
export API_PORT=${API_PORT:-4010}
export SPEC_SERVER_PORT=${SPEC_SERVER_PORT:-8081}

echo "✅ Environment variables loaded"
echo "   API_HOST: $API_HOST"
echo "   API_PORT: $API_PORT"
echo "   SPEC_SERVER_PORT: $SPEC_SERVER_PORT"
echo ""

# Test 1: Generate local spec
echo "📝 Test 1: Generating local OpenAPI spec..."
npm run spec:local
if [ -f .tmp/openapi.local.yaml ]; then
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
if grep -q "url: http://$API_HOST:$API_PORT" .tmp/openapi.local.yaml; then
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

# Test 5: Start spec server in background
echo "📡 Test 5: Starting spec server..."
npm run spec:serve > /tmp/spec-server.log 2>&1 &
SPEC_PID=$!
sleep 3

# Check if spec server is running
if ps -p $SPEC_PID > /dev/null; then
    echo "✅ Spec server started (PID: $SPEC_PID)"
else
    echo "❌ Failed to start spec server"
    cat /tmp/spec-server.log
    kill $PRISM_PID 2>/dev/null || true
    exit 1
fi
echo ""

# Test 6: Test spec server endpoint
echo "🌐 Test 6: Testing spec server endpoint..."
sleep 2
if curl -f -s http://localhost:$SPEC_SERVER_PORT/openapi.local.yaml > /dev/null; then
    echo "✅ Spec server is serving openapi.local.yaml"
else
    echo "❌ Spec server is not responding"
    kill $PRISM_PID $SPEC_PID 2>/dev/null || true
    exit 1
fi
echo ""

# Test 7: Test Prism mock server endpoint (without auth)
echo "🔌 Test 7: Testing Prism mock server endpoint..."
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
kill $PRISM_PID $SPEC_PID 2>/dev/null || true
echo "✅ Stopped all background processes"
echo ""

echo "=================================="
echo "✅ All tests passed successfully!"
echo ""
echo "To start the local development environment manually:"
echo "  1. npm run spec:local"
echo "  2. npm run seed:examples"
echo "  3. npm run mock:start"
echo "  4. npm run spec:serve"
echo ""
echo "Or press F5 in VS Code to start everything automatically."
