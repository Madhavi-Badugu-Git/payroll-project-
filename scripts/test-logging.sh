#!/bin/bash

# Winston Logging Test Script
# This script tests all logging features

echo "🚀 Testing Winston Logging Configuration"
echo "=========================================="

# Test 1: Valid API request
echo "📋 Test 1: Valid API request (should log info/debug)"
curl -s -X GET http://localhost:3000/api/holidays > /dev/null
echo "✅ GET /api/holidays completed"

# Test 2: Invalid request (should log debug warning)
echo "📋 Test 2: Invalid request (should log debug warning)"
curl -s -X POST http://localhost:3000/api/holidays \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}' > /dev/null
echo "✅ POST /api/holidays with invalid data completed"

# Test 3: Valid holiday creation (should log info)
echo "📋 Test 3: Valid holiday creation (should log info)"
curl -s -X POST http://localhost:3000/api/holidays \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Holiday", "date": "2025-12-31"}' > /dev/null
echo "✅ POST /api/holidays with valid data completed"

# Test 4: Duplicate holiday (should log debug)
echo "📋 Test 4: Duplicate holiday creation (should log debug)"
curl -s -X POST http://localhost:3000/api/holidays \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Holiday 2", "date": "2025-12-31"}' > /dev/null
echo "✅ POST /api/holidays with duplicate date completed"

echo ""
echo "🔍 Checking logs..."
echo "==================="

# Show recent application logs
echo "📄 Recent application logs:"
echo "----------------------------"
tail -10 logs/app-*.log | grep -E "(debug|info|warn|error)" | tail -5

echo ""
echo "📄 Recent error logs:"
echo "----------------------"
if [ -s logs/error-*.log ]; then
    tail -5 logs/error-*.log
else
    echo "No errors logged (this is good!)"
fi

echo ""
echo "✅ Logging test completed!"
echo "💡 View live logs with: npm run logs:view"
echo "🚨 View error logs with: npm run logs:errors"
