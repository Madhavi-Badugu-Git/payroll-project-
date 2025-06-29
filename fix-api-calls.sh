#!/bin/bash
# Script to update all API calls to use getApiUrl function

echo "Updating API calls to use getApiUrl function..."

# Files that need to be updated
files=(
  "src/hooks/useEmployees.ts"
  "src/hooks/useRegularization.ts" 
  "src/hooks/useLeaveManagement.ts"
  "src/hooks/useAttendance.ts"
  "src/hooks/useDashboard.ts"
)

# API endpoints to replace
endpoints=(
  "'/api/"
  '"/api/'
  "axios.get('/api/"
  "axios.post('/api/"
  "axios.put('/api/"
  "axios.patch('/api/"
  "axios.delete('/api/"
)

echo "Files to update: ${files[@]}"
echo "This script shows the locations that need manual updating..."

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo ""
    echo "=== $file ==="
    # Find all API calls
    grep -n "'/api/" "$file" || true
    grep -n '"/api/' "$file" || true
  fi
done

echo ""
echo "Manual updates required:"
echo "1. Add import: import { getApiUrl } from '../lib/api';"
echo "2. Replace '/api/endpoint' with getApiUrl('/endpoint')"
echo "3. Replace \"/api/endpoint\" with getApiUrl('/endpoint')"
