"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  variant?: "default" | "minimal" | "link";
  className?: string;
  children?: React.ReactNode;
  callbackUrl?: string;
}

export function SignOutButton({
  variant = "default",
  className = "",
  children,
  callbackUrl = "/"
}: SignOutButtonProps) {
  const signOutUrl = `/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  if (variant === "link") {
    return (
      <Link
        href={signOutUrl}
        className={`inline-flex items-center gap-2 text-ink underline-offset-4 hover:text-brand-gold hover:underline ${className}`}
      >
        {children || "Sign out"}
      </Link>
    );
  }

  if (variant === "minimal") {
    return (
      <Link
        href={signOutUrl}
        className={`group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-ink transition-colors hover:text-brand-gold ${className}`}
      >
        <LogOut className="h-3 w-3" />
        {children || "Sign out"}
      </Link>
    );
  }

  // Default button variant
  return (
    <Link
      href={signOutUrl}
      className={`group inline-flex items-center justify-center gap-3 rounded-full border border-ink/25 bg-transparent px-6 py-3 text-[11px] uppercase tracking-[0.32em] text-ink transition-all duration-500 hover:border-brand-rose hover:bg-brand-rose hover:text-parchment ${className}`}
    >
      <LogOut className="h-3 w-3" />
      {children || "Sign out"}
    </Link>
  );
}