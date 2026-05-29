/**
 * Test script to verify Monime checkout integration
 * This tests the checkout session creation without going through the full UI
 */

const BASE_URL = 'http://localhost:3001';

async function testCheckoutFlow() {
  console.log('🧪 Testing Monime Checkout Flow...\n');

  try {
    // Step 1: Get available products
    console.log('1. Fetching available products...');
    const productsRes = await fetch(`${BASE_URL}/api/products`);

    if (!productsRes.ok) {
      throw new Error(`Products API failed: ${productsRes.status}`);
    }

    const products = await productsRes.json();
    console.log(`✅ Found ${products.length} products available\n`);

    // Step 2: Create a test order (simulated data)
    console.log('2. Creating test order...');
    const testOrderData = {
      guestEmail: 'test@example.com',
      recipientName: 'Test Customer',
      phone: '+23231234567',
      streetAddress: 'Test Street 123',
      city: 'Freetown',
      deliveryZoneId: '', // Will need to get this
      items: [
        {
          variantId: '', // Will need to get this from products
          quantity: 1
        }
      ]
    };

    // Get the first product with available stock for testing
    const testProduct = products.find(p => p.variants.some(v => v.stock > 0));
    if (!testProduct) {
      throw new Error('No products with available stock found');
    }

    const testVariant = testProduct.variants.find(v => v.stock > 0);
    console.log(`📦 Using test product: ${testProduct.name} (${testVariant.size})`);

    // Create order via API
    const orderRes = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...testOrderData,
        deliveryZoneId: 'freetown-central', // Assume this exists
        items: [{
          variantId: testVariant.id,
          quantity: 1
        }]
      }),
    });

    if (!orderRes.ok) {
      const errorData = await orderRes.json();
      console.log(`❌ Order creation failed:`, errorData);
      return;
    }

    const orderData = await orderRes.json();
    console.log(`✅ Order created: ${orderData.orderId}\n`);

    // Step 3: Create Monime checkout session
    console.log('3. Creating Monime checkout session...');
    const sessionRes = await fetch(`${BASE_URL}/api/checkout/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: orderData.orderId,
        metadata: {
          customerEmail: testOrderData.guestEmail,
          deliveryZone: 'Freetown Central',
        },
        callbackState: `order_${orderData.orderId}`,
      }),
    });

    const sessionData = await sessionRes.json();

    if (!sessionRes.ok) {
      console.log(`❌ Session creation failed:`, sessionData);
      return;
    }

    console.log(`✅ Checkout session created successfully!`);
    console.log(`🔗 Session ID: ${sessionData.sessionId}`);
    console.log(`🔗 Redirect URL: ${sessionData.redirectUrl}`);

    // Step 4: Test payment verification (simulate success)
    console.log('\n4. Testing payment verification...');
    const verifyRes = await fetch(`${BASE_URL}/api/checkout/success?orderId=${orderData.orderId}&sessionId=${sessionData.sessionId}`);

    console.log(`📍 Verification response status: ${verifyRes.status}`);

    if (verifyRes.redirected) {
      console.log(`📍 Redirected to: ${verifyRes.url}`);
    }

    console.log('\n🎉 Monime checkout integration test completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log(`   - Product: ${testProduct.name}`);
    console.log(`   - Order ID: ${orderData.orderId}`);
    console.log(`   - Session ID: ${sessionData.sessionId}`);
    console.log(`   - In test mode: ${sessionData.sessionId.includes('test')}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testCheckoutFlow();