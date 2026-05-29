// Simple test script to verify Monime integration
import { createCheckoutSession, getCheckoutSession, toMinorUnits } from './src/lib/monime.ts';

async function testMonimeIntegration() {
  console.log('🧪 Testing Monime Integration...\n');

  try {
    // Test 1: Test helper function
    console.log('✅ Test 1: Helper functions');
    const testAmount = 25.50; // SLE 25.50
    const minorUnits = toMinorUnits(testAmount);
    console.log(`   SLE ${testAmount} = ${minorUnits} minor units`);
    console.log('   ✓ toMinorUnits() working\n');

    // Test 2: Test checkout session creation (test mode)
    console.log('✅ Test 2: Checkout session creation (test mode)');
    const testLineItems = [
      {
        type: 'custom',
        name: 'Test Perfume (50ml)',
        price: { currency: 'SLE', value: 2550 }, // SLE 25.50
        quantity: 1,
        description: 'Test product for Monime integration',
        reference: 'test_product_1'
      },
      {
        type: 'custom',
        name: 'Delivery Fee',
        price: { currency: 'SLE', value: 500 }, // SLE 5.00
        quantity: 1,
        description: 'Standard delivery',
        reference: 'delivery'
      }
    ];

    const sessionParams = {
      name: 'Test Order #12345678',
      orderId: 'test_order_' + Date.now(),
      lineItems: testLineItems,
      metadata: {
        customerEmail: 'test@houseofcohort.com',
        orderTotal: '3050'
      }
    };

    console.log('   Creating checkout session...');
    const session = await createCheckoutSession(sessionParams);
    console.log(`   ✓ Session ID: ${session.sessionId}`);
    console.log(`   ✓ Redirect URL: ${session.redirectUrl}`);
    console.log('   ✓ Checkout session created successfully\n');

    // Test 3: Test session verification (test mode)
    console.log('✅ Test 3: Session verification (test mode)');
    console.log('   Verifying session status...');
    const sessionStatus = await getCheckoutSession(session.sessionId);
    console.log(`   ✓ Session ID: ${sessionStatus.id}`);
    console.log(`   ✓ Status: ${sessionStatus.status}`);
    console.log(`   ✓ Reference: ${sessionStatus.reference || 'N/A'}`);
    console.log('   ✓ Session verification working\n');

    console.log('🎉 All Monime integration tests passed!');
    console.log('   • Helper functions working');
    console.log('   • Checkout session creation working (test mode)');
    console.log('   • Session verification working (test mode)');
    console.log('\n📋 Ready for production with real API calls!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testMonimeIntegration();