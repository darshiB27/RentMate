import connectDB from '../config/db.js';
import Property from '../models/property.model.js';

// We will fetch from local API server
const API_URL = 'http://localhost:5000/api/v1/search';

const runTest = async (testName, queryParams) => {
  const queryStr = new URLSearchParams(queryParams).toString();
  const url = `${API_URL}?${queryStr}`;
  console.log(`\n----------------------------------------`);
  console.log(`[TEST] ${testName}`);
  console.log(`[URL]  GET ${url}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      console.error(`[FAIL] HTTP status ${response.status}:`, errText);
      return;
    }
    
    const body = await response.json();
    const data = body.data;
    const properties = data.properties || [];
    const pagination = data.pagination || {};
    
    console.log(`[SUCCESS] Found ${properties.length} properties. Total count: ${pagination.total || 0}`);
    
    properties.forEach((p, idx) => {
      console.log(`  ${idx + 1}. [${p.type}] "${p.title}"`);
      console.log(`     - Price: ₹${p.price} | Locality: ${p.address?.locality} | City: ${p.address?.city}`);
      console.log(`     - Rating: ${p.ratingAverage} (${p.ratingCount} reviews) | Views: ${p.viewsCount} | Wishlists: ${p.wishlistCount}`);
      console.log(`     - Owner: ${JSON.stringify(p.ownerId)}`);
      console.log(`     - Amenities: ${p.amenities?.join(', ')}`);
      console.log(`     - Featured: ${p.isFeatured} | Verification: ${p.verificationStatus} | Status: ${p.availabilityStatus}`);
    });
    
    return data;
  } catch (error) {
    console.error(`[ERROR] Request failed:`, error.message);
  }
};

const verifyAll = async () => {
  console.log('=== STARTING PROPERTY SEARCH SYSTEM AUDIT VERIFICATION ===');

  // Test 1: Basic City Search (Bangalore)
  await runTest('Bangalore city search (default)', { city: 'Bangalore' });

  // Test 2: Keyword partial match (case insensitive, extra space ignoring)
  // Searching for "luxury   single"
  await runTest('Fuzzy keyword search ("luxury   single")', { city: 'Bangalore', searchQuery: 'luxury   single' });

  // Test 3: Filters (Price range: minPrice=10000, maxPrice=20000)
  await runTest('Price range filter (10,000 to 20,000 in Bangalore)', { city: 'Bangalore', minPrice: '10000', maxPrice: '20000' });

  // Test 4: Amenities filtering (Wifi and AC)
  await runTest('Amenities filter (Wifi and AC in Bangalore)', { city: 'Bangalore', amenities: 'Wifi,AC' });

  // Test 5: Verified owner filtering
  await runTest('Verified owner filter in Bangalore', { city: 'Bangalore', ownerVerified: 'true' });

  // Test 6: Unverified owner filtering (should return the HSR البنات PG with Jane)
  await runTest('Unverified owner properties in Bangalore', { city: 'Bangalore', ownerVerified: 'false' });

  // Test 7: Sorting by Price: Low to High
  await runTest('Sort by Price: Low to High', { city: 'Bangalore', sort: 'price_asc' });

  // Test 8: Sorting by Price: High to Low
  await runTest('Sort by Price: High to Low', { city: 'Bangalore', sort: 'price_desc' });

  // Test 9: Sorting by Most Viewed
  await runTest('Sort by Most Viewed', { city: 'Bangalore', sort: 'most_viewed' });

  // Test 10: Sorting by Most Wishlisted
  await runTest('Sort by Most Wishlisted', { city: 'Bangalore', sort: 'most_wishlisted' });

  // Test 11: Exclude non-available / non-approved properties
  await runTest('Bangalore stays (excluding pending/occupied/maintenance)', { city: 'Bangalore' });

  // --- NEW CITY SEARCH AUDIT TESTS ---
  // Test 12: Mumbai stays only
  await runTest('Mumbai city stays only', { city: 'Mumbai' });

  // Test 13: Delhi stays only
  await runTest('Delhi city stays only', { city: 'Delhi' });

  // Test 14: Gorakhpur stays only
  await runTest('Gorakhpur city stays only', { city: 'Gorakhpur' });

  // Test 15: Lucknow stays only
  await runTest('Lucknow city stays only', { city: 'Lucknow' });

  // Test 16: Case-insensitivity & Trim check ('  mUmBaI   ')
  await runTest('Case-insensitivity and spaces trim test ("  mUmBaI   ")', { city: '  mUmBaI   ' });

  // Test 17: Mumbai stays with keyword "boys"
  await runTest('Mumbai stays with keyword "boys"', { city: 'Mumbai', searchQuery: 'boys' });

  // Test 18: Gorakhpur stays with keyword "hostel"
  await runTest('Gorakhpur stays with keyword "hostel"', { city: 'Gorakhpur', searchQuery: 'hostel' });

  // Test 19: Lucknow stays with price filter (Hazratganj stay should match)
  await runTest('Lucknow stays with maxPrice=8000', { city: 'Lucknow', maxPrice: '8000' });

  console.log('\n=== VERIFICATION AUDIT COMPLETE ===');
};

verifyAll();
