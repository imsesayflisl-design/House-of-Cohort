"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface PaymentVerificationProps {
  orderId: string;
  onVerificationResult: (result: { verified: boolean; error?: string }) => void;
}

export function PaymentVerification({
  orderId,
  onVerificationResult
}: PaymentVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sid");

  useEffect(() => {
    // Only verify if we have a session ID (payment flow)
    if (!sessionId) {
      onVerificationResult({ verified: true }); // No verification needed
      return;
    }

    async function verifyPayment() {
      setIsVerifying(true);

      try {
        const verifyResponse = await fetch(
          `/api/checkout/verify?orderId=${orderId}&sid=${sessionId}`,
          { cache: "no-store" }
        );

        if (!verifyResponse.ok) {
          onVerificationResult({
            verified: false,
            error: "Payment verification failed. If you were charged, please contact us."
          });
          return;
        }

        const verifyData = await verifyResponse.json();
        onVerificationResult({
          verified: verifyData.verified,
          error: verifyData.verified ? undefined : "Payment could not be confirmed. Please contact us if you were charged."
        });
      } catch (error) {
        console.error("Payment verification error:", error);
        onVerificationResult({
          verified: false,
          error: "We encountered an error verifying your payment. Please contact us if you were charged."
        });
      } finally {
        setIsVerifying(false);
      }
    }

    verifyPayment();
  }, [orderId, sessionId, onVerificationResult]);

  // Return loading state if verification is in progress
  if (isVerifying) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
          — Verifying payment —
        </p>
        <h1 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-light leading-[1.02] text-ink">
          Confirming your order
        </h1>
        <p className="mt-6 font-serif text-base leading-relaxed text-ink/75">
          Please wait while we verify your payment...
        </p>
      </div>
    );
  }

  return null; // Don't render anything when not verifying
}