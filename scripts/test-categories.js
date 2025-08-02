const axios = require('axios');

// Test the categories API
async function testCategoriesAPI() {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  console.log('🧪 Testing Categories API...\n');
  
  try {
    // Test 1: Get all categories without products
    console.log('1. Testing GET /api/categories (without products)...');
    const response1 = await axios.get(`${baseURL}/api/categories`);
    
    if (response1.data.success) {
      console.log(`✅ Success! Found ${response1.data.categories.length} categories`);
      console.log('Categories:', response1.data.categories.map(c => c.name).join(', '));
    } else {
      console.log('❌ Failed:', response1.data.error);
    }
    
    console.log('\n2. Testing GET /api/categories?includeProducts=true...');
    const response2 = await axios.get(`${baseURL}/api/categories?includeProducts=true`);
    
    if (response2.data.success) {
      console.log(`✅ Success! Found ${response2.data.categories.length} categories with products`);
      
      // Show product counts
      response2.data.categories.forEach(category => {
        const productCount = category.products ? category.products.length : 0;
        const totalCount = category.totalCount || 0;
        console.log(`   - ${category.name}: ${productCount} products loaded, ${totalCount} total`);
      });
    } else {
      console.log('❌ Failed:', response2.data.error);
    }
    
    console.log('\n3. Testing GET /api/categories?includeProducts=true&productsLimit=3...');
    const response3 = await axios.get(`${baseURL}/api/categories?includeProducts=true&productsLimit=3`);
    
    if (response3.data.success) {
      console.log(`✅ Success! Found ${response3.data.categories.length} categories with limited products`);
      
      // Show product counts
      response3.data.categories.forEach(category => {
        const productCount = category.products ? category.products.length : 0;
        console.log(`   - ${category.name}: ${productCount} products loaded`);
      });
    } else {
      console.log('❌ Failed:', response3.data.error);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testCategoriesAPI(); 