"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, LogIn } from "lucide-react";

import { SignOutButton } from "./SignOutButton";

interface AuthStatusProps {
  variant?: "full" | "compact" | "icon";
  className?: string;
  showRole?: boolean;
}

export function AuthStatus({
  variant = "full",
  className = "",
  showRole = false
}: AuthStatusProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 w-24 rounded bg-ink/10"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    if (variant === "icon") {
      return (
        <Link
          href="/auth/signin"
          className={`flex h-8 w-8 items-center justify-center rounded-full border border-ink/25 text-ink transition-colors hover:border-brand-gold hover:text-brand-gold ${className}`}
          title="Sign in"
        >
          <LogIn className="h-4 w-4" />
        </Link>
      );
    }

    if (variant === "compact") {
      return (
        <Link
          href="/auth/signin"
          className={`group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-ink transition-colors hover:text-brand-gold ${className}`}
        >
          <LogIn className="h-3 w-3" />
          Sign in
        </Link>
      );
    }

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <span className="font-serif text-sm italic text-ink/70">
          Not signed in
        </span>
        <Link
          href="/auth/signin"
          className="group inline-flex items-center gap-2 rounded-full border border-ink/25 bg-transparent px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-ink transition-all duration-500 hover:border-brand-gold hover:text-brand-gold"
        >
          <LogIn className="h-3 w-3" />
          Sign in
        </Link>
      </div>
    );
  }

  // User is authenticated
  const user = session.user;

  if (variant === "icon") {
    return (
      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold ${className}`} title={user.email || "Signed in"}>
        <User className="h-4 w-4" />
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
          <User className="h-3 w-3" />
        </div>
        <span className="text-[11px] uppercase tracking-[0.32em] text-ink">
          {user.name?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
        </span>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
          <User className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-sm text-ink">
            {user.name || user.email}
          </span>
          {user.name && user.email && (
            <span className="text-[10px] uppercase tracking-[0.32em] text-ink/55">
              {user.email}
            </span>
          )}
          {showRole && user.role && (
            <span className="text-[9px] uppercase tracking-[0.4em] text-brand-gold">
              {user.role}
            </span>
          )}
        </div>
      </div>
      <SignOutButton variant="minimal" />
    </div>
  );
}