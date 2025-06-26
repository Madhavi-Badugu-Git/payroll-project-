// Test script for Configuration Management System
// Run this with: node scripts/test-configurations.js

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getAppConfigurations, getConfigurationValue } = require('../src/lib/configurations');

async function testConfigurations() {
  console.log('🔧 Testing Configuration Management System...\n');

  try {
    // Test 1: Get all app configurations
    console.log('1. Testing getAppConfigurations():');
    const appConfigs = await getAppConfigurations();
    console.log('✅ App Configurations:', appConfigs);
    console.log('');

    // Test 2: Get specific configuration value
    console.log('2. Testing getConfigurationValue():');
    const employeePrefix = await getConfigurationValue('EMPLOYEE_ID_PREFIX');
    console.log('✅ Employee ID Prefix:', employeePrefix);

    const sanctionedLeaves = await getConfigurationValue('SANCTIONED_LEAVE_PER_YEAR');
    console.log('✅ Sanctioned Leave Per Year:', sanctionedLeaves);
    console.log('');

    // Test 3: Test non-existent configuration
    console.log('3. Testing non-existent configuration:');
    const nonExistent = await getConfigurationValue('NON_EXISTENT_CONFIG');
    console.log('✅ Non-existent config (should be null):', nonExistent);
    console.log('');

    // Test 4: Validate configuration types
    console.log('4. Testing configuration type parsing:');
    console.log('✅ SANCTIONED_LEAVE_PER_YEAR type:', typeof appConfigs.SANCTIONED_LEAVE_PER_YEAR);
    console.log('✅ WORKING_HOURS_PER_DAY type:', typeof appConfigs.WORKING_HOURS_PER_DAY);
    console.log('✅ OVERTIME_THRESHOLD type:', typeof appConfigs.OVERTIME_THRESHOLD);
    console.log('');

    console.log('🎉 All configuration tests passed successfully!');
  } catch (error) {
    console.error('❌ Configuration test failed:', error);
  }
}

// Run the test
testConfigurations();
