"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { Ornament } from "@/components/store/Ornament";

export default function SignOutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut({
        redirect: false,
        callbackUrl
      });

      // Clear any client-side state if needed
      // Force navigation to callback URL
      window.location.href = callbackUrl;
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  // If user is not signed in, redirect to sign-in page
  if (!session) {
    router.replace("/auth/signin");
    return null;
  }

  return (
    <div className="relative isolate flex min-h-screen overflow-hidden bg-parchment">
      {/* Decorative ornaments */}
      <Ornament
        variant="botanical"
        className="pointer-events-none absolute -left-16 top-12 hidden h-[440px] w-[440px] text-brand-gold/22 lg:block"
      />
      <Ornament
        variant="sprig"
        className="pointer-events-none absolute -right-8 bottom-12 hidden h-[280px] w-[200px] -scale-x-100 text-ink/12 lg:block"
      />

      {/* Edition meta */}
      <div className="absolute left-0 right-0 top-0 z-10 mx-auto flex max-w-[1400px] items-center justify-between px-5 pt-6 text-[10px] uppercase tracking-[0.4em] text-ink/55 sm:px-8 lg:px-12">
        <Link href="/" className="hover:text-ink">
          ← House of Cohort
        </Link>
        <span>Vol. I · Maison</span>
      </div>

      {/* Sign-out form */}
      <div className="relative mx-auto flex w-full max-w-md flex-col justify-center px-5 py-24 sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
          Reader farewell
        </p>
        <h1 className="mt-5 font-display text-[clamp(2.6rem,5vw,4rem)] font-light leading-[0.96] tracking-[-0.015em] text-ink">
          Until <em className="italic text-brand-gold">next time.</em>
        </h1>
        <p className="mt-5 max-w-sm font-serif text-base leading-relaxed text-ink/70">
          Are you sure you wish to sign out? Your bag and wishlist will be
          preserved for your return to the maison.
        </p>

        {/* User info */}
        {session?.user && (
          <div className="mt-8 rounded-sm border border-ink/15 bg-parchment-soft p-4">
            <p className="text-[10px] uppercase tracking-[0.32em] text-ink/55">
              Currently signed in as
            </p>
            <p className="mt-1 font-display text-lg text-ink">
              {session.user.email}
            </p>
            {session.user.name && (
              <p className="mt-0.5 font-serif text-sm italic text-ink/70">
                {session.user.name}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-10 space-y-4">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-rose px-7 py-4 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 hover:bg-brand-rose/90 disabled:opacity-50"
          >
            {isSigningOut ? "Signing out…" : "Yes, sign me out"}
            {!isSigningOut && (
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            )}
          </button>

          <button
            onClick={handleCancel}
            disabled={isSigningOut}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-ink/25 bg-transparent px-6 py-3.5 text-[11px] uppercase tracking-[0.32em] text-ink transition-colors hover:border-brand-gold hover:text-brand-gold disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <p className="mt-10 text-center font-serif text-base italic text-ink/65">
          Need to switch accounts?{" "}
          <Link
            href="/auth/signin"
            className="text-ink underline-offset-4 hover:text-brand-gold hover:underline"
          >
            Sign in differently
          </Link>
        </p>
      </div>
    </div>
  );
}