#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files that need import cleanup
const filesToFix = [
  'src/app/api/admin/users/route.ts',
  'src/app/api/auth/signup/route.ts',
  'src/app/api/configurations/route.ts',
  'src/app/api/cron/leave-tasks/route.ts',
  'src/app/api/health/route.ts',
  'src/app/api/holidays/[id]/route.ts',
  'src/app/api/leave/route.ts',
  'src/app/api/leave-management/route.ts',
  'src/app/api/payslips/[id]/route.ts',
  'src/app/api/payslips/bulk/route.ts',
  'src/app/api/promotions/[id]/route.ts',
  'src/app/api/promotions/route.ts',
  'src/app/api/roles/route.ts',
];

function analyzeAndFixImports(filePath) {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Check which logger functions are actually used
  const usesLogError = content.includes('logError(');
  const usesLogInfo = content.includes('logInfo(');
  const usesLogDebug = content.includes('logDebug(');

  // Build the correct import
  const neededImports = [];
  if (usesLogError) neededImports.push('logError');
  if (usesLogInfo) neededImports.push('logInfo');
  if (usesLogDebug) neededImports.push('logDebug');

  if (neededImports.length === 0) {
    // Remove logger import entirely if nothing is used
    content = content.replace(/import\s+{[^}]+}\s+from\s+'@\/lib\/logger';\s*\n/, '');
  } else {
    // Replace with only needed imports
    const newImport = `import { ${neededImports.join(', ')} } from '@/lib/logger';`;
    content = content.replace(/import\s+{[^}]+}\s+from\s+'@\/lib\/logger';/, newImport);
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Fixed imports for: ${filePath} (using: ${neededImports.join(', ') || 'none'})`);
  return true;
}

console.log('🔧 Fixing unused logger imports...\n');

for (const filePath of filesToFix) {
  analyzeAndFixImports(filePath);
}

console.log('\n🎉 All imports fixed!');
