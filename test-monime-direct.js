/**
 * Direct test of Monime functions without requiring the server
 * Tests the core Monime integration logic
 */

// Simulate environment variables
process.env.MONIME_API_KEY = 'mon_test_NIgRprocgl43eCocLcOHXRqIY1Y9Tdv19fjiSV0pqNUdvNZhlyzm5fw0iRtMDk2p';
process.env.MONIME_SPACE_ID = 'spc-test-space-id';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3001';
process.env.NODE_ENV = 'development';

async function testMonimeDirectly() {
  console.log('🧪 Testing Monime Functions Directly...\n');

  try {
    // Import the Monime functions
    const { createCheckoutSession, getCheckoutSession, convertToMonimeLineItems } =
      await import('./src/lib/monime.ts');

    console.log('1. Testing convertToMonimeLineItems...');
    const sampleCartItems = [
      {
        product: { name: 'Chanel No. 5' },
        variant: { size: '50ml' },
        quantity: 1,
        price: 28000 // Already in minor units (280.00 SLE)
      },
      {
        product: { name: 'Tom Ford Oud Wood' },
        variant: { size: '100ml' },
        quantity: 2,
        price: 92000 // Already in minor units (920.00 SLE)
      }
    ];

    const lineItems = convertToMonimeLineItems(sampleCartItems);
    console.log('✅ Line items converted successfully:');
    lineItems.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.name}: ${item.quantity} × ${item.price.value / 100} SLE`);
    });

    console.log('\n2. Testing createCheckoutSession...');
    const mockOrderId = 'test_order_12345678';

    const sessionParams = {
      name: `House of Cohort Order #${mockOrderId.slice(-8).toUpperCase()}`,
      orderId: mockOrderId,
      lineItems,
      metadata: {
        orderId: mockOrderId,
        customerEmail: 'test@example.com',
        orderTotal: '120000', // 1200.00 SLE
      },
      callbackState: `order_${mockOrderId}`
    };

    const session = await createCheckoutSession(sessionParams);
    console.log('✅ Checkout session created successfully:');
    console.log(`   Session ID: ${session.sessionId}`);
    console.log(`   Redirect URL: ${session.redirectUrl}`);
    console.log(`   Test Mode: ${session.sessionId.includes('test')}`);

    console.log('\n3. Testing getCheckoutSession...');
    const sessionStatus = await getCheckoutSession(session.sessionId);
    console.log('✅ Session status retrieved:');
    console.log(`   ID: ${sessionStatus.id}`);
    console.log(`   Status: ${sessionStatus.status}`);

    console.log('\n🎉 All Monime functions work correctly!');
    console.log('\n📋 Test Results Summary:');
    console.log(`   ✅ Line item conversion: ${lineItems.length} items processed`);
    console.log(`   ✅ Session creation: ${session.sessionId}`);
    console.log(`   ✅ Session verification: ${sessionStatus.status}`);
    console.log(`   ✅ Test mode active: ${session.sessionId.includes('test')}`);

    return true;

  } catch (error) {
    console.error('❌ Direct test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    return false;
  }
}

// Run the test
testMonimeDirectly().then(success => {
  process.exit(success ? 0 : 1);
});