import { PaymentForm } from "@/components/checkout/PaymentForm";

export default function TestPaymentPage() {
  return (
    <div className="min-h-screen bg-parchment p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-display text-4xl font-light text-ink">
          Payment Form Demo
        </h1>

        <div className="mb-8 rounded-lg border border-ink/20 bg-white p-6">
          <h2 className="mb-4 font-display text-2xl text-ink">
            Payment Form Features:
          </h2>
          <ul className="space-y-2 text-ink/80">
            <li>✅ Sierra Leone bank selection</li>
            <li>✅ Card number formatting (automatic spacing)</li>
            <li>✅ Expiry date formatting (MM/YY)</li>
            <li>✅ CVV security handling</li>
            <li>✅ Form validation with error messages</li>
            <li>✅ Test mode simulation (for development)</li>
            <li>✅ Secure payment processing with Monime</li>
          </ul>
        </div>

        <div className="rounded-lg border border-brand-gold/30 bg-brand-gold/5 p-6">
          <h3 className="mb-4 font-display text-xl text-ink">
            Test Instructions:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-ink/80">
            <li>Go to the store and add items to your cart</li>
            <li>Proceed to checkout and fill out delivery details</li>
            <li>Click "Complete the order" - payment form will appear</li>
            <li>Fill out bank details and click "Pay Now"</li>
            <li>Payment will be processed and you'll be redirected to success page</li>
          </ol>

          <div className="mt-6 rounded border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Test Mode:</strong> Use any card number except "1234567890123456"
              (which simulates a declined card for testing failures).
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3 text-sm uppercase tracking-wide text-parchment transition-all hover:bg-brand-gold hover:text-ink"
          >
            Go to Store →
          </a>
        </div>
      </div>
    </div>
  );
}