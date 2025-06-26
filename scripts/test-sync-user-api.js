// Test script to simulate sync-user API functionality
const testSyncUser = async () => {
  try {
    console.log('Testing sync-user API functionality...\n');

    // Simulate a sync-user API call
    const response = await fetch('http://localhost:3000/api/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test_clerk_user_123', // This would come from Clerk
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Sync-user API response:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.json();
      console.log('❌ Sync-user API error:', error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testSyncUser();
