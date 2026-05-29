import Link from "next/link";
import { Suspense } from "react";
import { Ornament } from "@/components/store/Ornament";
import { Reveal } from "@/components/motion/Reveal";

interface CheckoutFailedPageProps {
  searchParams: Promise<{
    orderId?: string;
    reason?: string;
  }>;
}

export default function CheckoutFailedPage({ searchParams }: CheckoutFailedPageProps) {
  return (
    <Suspense fallback={<LoadingView />}>
      <CheckoutFailedContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CheckoutFailedContent({ searchParams }: CheckoutFailedPageProps) {
  const params = await searchParams;
  const orderId = params.orderId;
  const reason = params.reason || "payment_failed";

  return (
    <div className="relative isolate overflow-hidden pb-32 pt-16 lg:pt-24">
      <Ornament
        variant="botanical"
        className="pointer-events-none absolute -left-12 top-12 hidden h-[420px] w-[420px] text-brand-rose/20 lg:block"
      />
      <Ornament
        variant="sprig"
        className="pointer-events-none absolute -right-10 top-32 hidden h-[280px] w-[200px] -scale-x-100 text-brand-rose/15 lg:block"
      />

      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <FailureIcon />
            <p className="mt-7 text-[10px] uppercase tracking-[0.5em] text-brand-rose">
              — Payment Issue —
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.8rem,6.5vw,4.8rem)] font-light leading-[0.96] tracking-[-0.015em] text-ink">
              {getFailureHeading(reason)}
            </h1>
            <p className="mt-6 font-serif text-lg leading-relaxed text-ink/75">
              {getFailureMessage(reason)}
            </p>
            {orderId && (
              <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-ink/55">
                Order Reference{" "}
                <span className="font-display text-base normal-case tracking-normal text-ink">
                  {orderId.slice(-8).toUpperCase()}
                </span>
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.16} className="mt-12">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <Link
              href="/checkout"
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 hover:bg-brand-gold hover:text-ink"
            >
              Try again
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink transition-colors hover:text-brand-gold"
            >
              Continue browsing
              <span className="inline-block h-px w-10 bg-ink/40 transition-all duration-500 group-hover:w-14 group-hover:bg-brand-gold" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.22} className="mt-8">
          <div className="border border-ink/12 bg-parchment-soft p-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-4">
              Need Help?
            </p>
            <p className="font-serif text-base leading-relaxed text-ink/75 mb-4">
              If you continue experiencing issues, please contact our support team.
              Your cart has been preserved and you can try again at any time.
            </p>
            <p className="text-[10px] uppercase tracking-[0.32em] text-ink/55">
              Email{" "}
              <a
                href="mailto:support@houseofcohort.com"
                className="text-ink underline-offset-4 hover:text-brand-gold hover:underline"
              >
                support@houseofcohort.com
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function getFailureHeading(reason: string): string {
  switch (reason) {
    case "payment_cancelled":
      return "Payment was cancelled.";
    case "payment_expired":
      return "Payment session expired.";
    case "insufficient_funds":
      return "Payment declined.";
    case "invalid_card":
      return "Card details invalid.";
    default:
      return "Payment could not be processed.";
  }
}

function getFailureMessage(reason: string): string {
  switch (reason) {
    case "payment_cancelled":
      return "You cancelled the payment process. Your cart has been preserved and you can try again whenever you're ready.";
    case "payment_expired":
      return "The payment session timed out. Your cart has been preserved and you can try again with a new session.";
    case "insufficient_funds":
      return "Your payment was declined due to insufficient funds. Please check your account balance or try a different payment method.";
    case "invalid_card":
      return "The card details provided were invalid. Please check your card information and try again.";
    default:
      return "We encountered an issue processing your payment. Your cart has been preserved and you can try again.";
  }
}

function FailureIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="size-24 text-brand-rose"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <style>{`
        .failure-stroke {
          stroke-dasharray: 320;
          stroke-dashoffset: 320;
          animation: failure-draw 1.4s cubic-bezier(0.65,0,0.35,1) 0.2s forwards;
        }
        .failure-stroke-2 {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: failure-draw 1s cubic-bezier(0.65,0,0.35,1) 1.2s forwards;
        }
        @keyframes failure-draw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .failure-stroke, .failure-stroke-2 { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
      <circle cx="60" cy="60" r="50" className="failure-stroke" />
      <path
        d="M45 45l30 30M45 75l30-30"
        className="failure-stroke-2"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function LoadingView() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
      <p className="text-[10px] uppercase tracking-[0.5em] text-ink/55">
        — Loading —
      </p>
      <h1 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-light leading-[1.02] text-ink">
        Processing request
      </h1>
    </div>
  );
}