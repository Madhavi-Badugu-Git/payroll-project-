import { authOptions } from './src/lib/auth/config.ts';

// Mock request and response objects for testing
const mockRequest = {
  headers: new Map(),
  cookies: new Map(),
};

const mockResponse = {
  headers: new Map(),
};

async function testSessionAPI() {
  try {
    console.log('🔍 Testing Session API...\n');

    // This won't work without actual HTTP context, but let's see the config
    console.log('NextAuth configuration:');
    console.log('- Strategy:', authOptions.session?.strategy);
    console.log('- Has JWT callback:', !!authOptions.callbacks?.jwt);
    console.log('- Has session callback:', !!authOptions.callbacks?.session);

    console.log('\nJWT callback function:');
    console.log(authOptions.callbacks?.jwt?.toString());

    console.log('\nSession callback function:');
    console.log(authOptions.callbacks?.session?.toString());
  } catch (error) {
    console.error('❌ Error testing session API:', error);
  }
}

testSessionAPI();
