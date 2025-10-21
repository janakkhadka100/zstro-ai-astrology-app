// test-api.js
// Simple test script to verify API endpoints

const testUserProfile = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/user/profile');
    const data = await response.json();
    console.log('✅ User Profile API:', data);
    return data;
  } catch (error) {
    console.error('❌ User Profile API Error:', error);
  }
};

const testAstroBootstrap = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/astro/bootstrap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'demo-user-123', lang: 'ne' })
    });
    const data = await response.json();
    console.log('✅ Astro Bootstrap API:', data);
    return data;
  } catch (error) {
    console.error('❌ Astro Bootstrap API Error:', error);
  }
};

const testLanguageSwitching = () => {
  console.log('🌍 Testing Language Switching...');
  console.log('Current language should be detected from localStorage or browser');
};

// Run tests
(async () => {
  console.log('🧪 Testing ZSTRO AI APIs...\n');
  
  await testUserProfile();
  console.log('');
  
  await testAstroBootstrap();
  console.log('');
  
  testLanguageSwitching();
})();
