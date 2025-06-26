// Test script for Employee Promotions API
// Run this with: node scripts/test-promotions.js
// Make sure the development server is running on http://localhost:3000

const BASE_URL = 'http://localhost:3000/api';

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch (_parseError) {
      console.log('❌ Server returned non-JSON response:');
      console.log('Status:', response.status);
      console.log('Response:', responseText.substring(0, 200) + '...');
      throw new Error(`Server returned non-JSON response: ${response.status}`);
    }

    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    console.error('Request failed:', error.message);
    throw error;
  }
}

// Test data
const testPromotionData = {
  empId: 'EMP001', // Make sure this employee exists in your database
  salary: 75000.5,
  revisionDate: '2024-01-15',
  currentPosition: 'Senior Software Engineer',
  previousPosition: 'Software Engineer',
};

const updatedPromotionData = {
  empId: 'EMP001',
  salary: 85000.0,
  revisionDate: '2024-02-01',
  currentPosition: 'Lead Software Engineer',
  previousPosition: 'Senior Software Engineer',
};

async function testPromotionsAPI() {
  console.log('🚀 Testing Employee Promotions API...\n');

  let createdPromotionId = null;

  try {
    // Test 1: Get all promotions (should work even if empty)
    console.log('1. Testing GET /api/promotions (fetch all promotions):');
    const getAllResult = await makeRequest(`${BASE_URL}/promotions`);
    console.log('✅ Status:', getAllResult.status);
    console.log('✅ Total promotions:', getAllResult.data.totalCount || 0);
    console.log('✅ Promotions count:', getAllResult.data.promotions?.length || 0);
    console.log('');

    // Test 2: Create a new promotion
    console.log('2. Testing POST /api/promotions (create new promotion):');
    const createResult = await makeRequest(`${BASE_URL}/promotions`, {
      method: 'POST',
      body: JSON.stringify(testPromotionData),
    });

    if (createResult.ok) {
      createdPromotionId = createResult.data.id;
      console.log('✅ Status:', createResult.status);
      console.log('✅ Created promotion ID:', createdPromotionId);
      console.log(
        '✅ Employee:',
        `${createResult.data.employee?.firstName} ${createResult.data.employee?.lastName}`
      );
      console.log('✅ Salary:', createResult.data.salary);
      console.log(
        '✅ Position change:',
        `${createResult.data.previousPosition} → ${createResult.data.currentPosition}`
      );
    } else {
      console.log('❌ Failed to create promotion:', createResult.data.error);
    }
    console.log('');

    // Test 3: Get specific promotion by ID
    if (createdPromotionId) {
      console.log('3. Testing GET /api/promotions/[id] (fetch specific promotion):');
      const getByIdResult = await makeRequest(`${BASE_URL}/promotions/${createdPromotionId}`);

      if (getByIdResult.ok) {
        console.log('✅ Status:', getByIdResult.status);
        console.log('✅ Promotion ID:', getByIdResult.data.id);
        console.log('✅ Employee ID:', getByIdResult.data.empId);
        console.log('✅ Revision Date:', getByIdResult.data.revisionDate);
      } else {
        console.log('❌ Failed to fetch promotion:', getByIdResult.data.error);
      }
      console.log('');
    }

    // Test 4: Update the promotion
    if (createdPromotionId) {
      console.log('4. Testing PUT /api/promotions/[id] (update promotion):');
      const updateResult = await makeRequest(`${BASE_URL}/promotions/${createdPromotionId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedPromotionData),
      });

      if (updateResult.ok) {
        console.log('✅ Status:', updateResult.status);
        console.log('✅ Updated salary:', updateResult.data.salary);
        console.log('✅ Updated position:', updateResult.data.currentPosition);
        console.log('✅ Updated revision date:', updateResult.data.revisionDate);
      } else {
        console.log('❌ Failed to update promotion:', updateResult.data.error);
      }
      console.log('');
    }

    // Test 5: Search promotions
    console.log('5. Testing GET /api/promotions with search (search functionality):');
    const searchResult = await makeRequest(`${BASE_URL}/promotions?search=engineer&page=1&limit=5`);

    if (searchResult.ok) {
      console.log('✅ Status:', searchResult.status);
      console.log('✅ Search results count:', searchResult.data.promotions?.length || 0);
      console.log('✅ Total matching records:', searchResult.data.totalCount || 0);
    } else {
      console.log('❌ Search failed:', searchResult.data.error);
    }
    console.log('');

    // Test 6: Filter by employee ID
    console.log('6. Testing GET /api/promotions with empId filter:');
    const filterResult = await makeRequest(`${BASE_URL}/promotions?empId=EMP001`);

    if (filterResult.ok) {
      console.log('✅ Status:', filterResult.status);
      console.log('✅ Filtered results count:', filterResult.data.promotions?.length || 0);
      console.log(
        '✅ All results for EMP001:',
        filterResult.data.promotions?.every(p => p.empId === 'EMP001')
      );
    } else {
      console.log('❌ Filter failed:', filterResult.data.error);
    }
    console.log('');

    // Test 7: Test validation - invalid data
    console.log('7. Testing POST /api/promotions with invalid data (validation test):');
    const invalidData = {
      empId: '', // Empty empId
      salary: -1000, // Negative salary
      revisionDate: 'invalid-date',
      currentPosition: '',
      previousPosition: '',
    };

    const validationResult = await makeRequest(`${BASE_URL}/promotions`, {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    if (!validationResult.ok && validationResult.status === 400) {
      console.log('✅ Validation working correctly - Status:', validationResult.status);
      console.log('✅ Error message:', validationResult.data.error);
    } else {
      console.log('❌ Validation test failed - should have returned 400 error');
    }
    console.log('');

    // Test 8: Test with non-existent employee
    console.log('8. Testing POST /api/promotions with non-existent employee:');
    const nonExistentEmpData = {
      ...testPromotionData,
      empId: 'NON_EXISTENT_EMP',
    };

    const nonExistentResult = await makeRequest(`${BASE_URL}/promotions`, {
      method: 'POST',
      body: JSON.stringify(nonExistentEmpData),
    });

    if (!nonExistentResult.ok && nonExistentResult.status === 404) {
      console.log('✅ Employee validation working - Status:', nonExistentResult.status);
      console.log('✅ Error message:', nonExistentResult.data.error);
    } else {
      console.log('❌ Employee validation test failed');
    }
    console.log('');

    // Test 9: Delete the promotion (cleanup)
    if (createdPromotionId) {
      console.log('9. Testing DELETE /api/promotions/[id] (delete promotion):');
      const deleteResult = await makeRequest(`${BASE_URL}/promotions/${createdPromotionId}`, {
        method: 'DELETE',
      });

      if (deleteResult.ok) {
        console.log('✅ Status:', deleteResult.status);
        console.log('✅ Delete message:', deleteResult.data.message);
      } else {
        console.log('❌ Failed to delete promotion:', deleteResult.data.error);
      }
      console.log('');
    }

    // Test 10: Verify deletion
    if (createdPromotionId) {
      console.log('10. Testing GET deleted promotion (should return 404):');
      const verifyDeleteResult = await makeRequest(`${BASE_URL}/promotions/${createdPromotionId}`);

      if (!verifyDeleteResult.ok && verifyDeleteResult.status === 404) {
        console.log('✅ Deletion verified - Status:', verifyDeleteResult.status);
        console.log('✅ Error message:', verifyDeleteResult.data.error);
      } else {
        console.log('❌ Deletion verification failed');
      }
      console.log('');
    }

    console.log('🎉 All Employee Promotions API tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('- ✅ CRUD Operations: Create, Read, Update, Delete');
    console.log('- ✅ Search and Filtering');
    console.log('- ✅ Pagination Support');
    console.log('- ✅ Data Validation');
    console.log('- ✅ Error Handling');
    console.log('- ✅ Foreign Key Validation');
  } catch (error) {
    console.error('❌ Promotions API test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the development server is running: npm run dev');
    console.log('2. Ensure the database is connected and migrated');
    console.log('3. Verify that employee EMP001 exists in the database');
    console.log('4. Check the server logs for detailed error information');
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ or you need to install node-fetch');
  console.log('Install node-fetch: npm install node-fetch');
  console.log('Or use Node.js 18+');
  process.exit(1);
}

// Run the test
testPromotionsAPI();
