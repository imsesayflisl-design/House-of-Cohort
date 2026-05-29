import Link from "next/link";
import { Suspense } from "react";

import { auth } from "@/lib/auth";
import { CheckoutSuccessClient } from "./CheckoutSuccessClient";

export const dynamic = "force-dynamic";

type SearchParams = { orderId?: string; sid?: string };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  let orderId: string | undefined;

  try {
    const params = await searchParams;
    orderId = params.orderId;
  } catch (error) {
    console.error("Error parsing search params:", error);
    return (
      <ErrorView
        title="Invalid request"
        body="We couldn't process this request. Please try again or contact support."
        ctaHref="/"
        ctaLabel="Return home"
      />
    );
  }

  if (!orderId) {
    return (
      <ErrorView
        title="No order in this letter"
        body="We couldn't find an order reference. If you completed a purchase, please contact the maison."
        ctaHref="/"
        ctaLabel="Return to the home"
      />
    );
  }

  try {
    const session = await auth();

    return (
      <Suspense fallback={<LoadingView />}>
        <CheckoutSuccessClient orderId={orderId} userId={session?.user?.id} />
      </Suspense>
    );
  } catch (error) {
    console.error("Error in checkout success page:", error);
    return (
      <ErrorView
        title="Something went wrong"
        body="We encountered an error loading this page. Please try again or contact support."
        ctaHref="/"
        ctaLabel="Return home"
      />
    );
  }
}

function LoadingView() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
      <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
        — Loading —
      </p>
      <h1 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-light leading-[1.02] text-ink">
        Loading your order
      </h1>
      <p className="mt-6 font-serif text-base leading-relaxed text-ink/75">
        Please wait while we prepare your order details...
      </p>
    </div>
  );
}

function ErrorView({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
      <p className="text-[10px] uppercase tracking-[0.5em] text-brand-rose">
        — A small note —
      </p>
      <h1 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-light leading-[1.02] text-ink">
        {title}
      </h1>
      <p className="mt-6 font-serif text-base leading-relaxed text-ink/75">
        {body}
      </p>
      <Link
        href={ctaHref}
        className="group mt-10 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 hover:bg-brand-gold hover:text-ink"
      >
        {ctaLabel}
        <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
          →
        </span>
      </Link>
    </div>
  );
}
