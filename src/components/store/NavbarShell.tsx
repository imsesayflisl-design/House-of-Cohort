"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

const NAV_LINKS = [
  { href: "/products", label: "Collection" },
  { href: "/products?category=oud", label: "Oud" },
  { href: "/products?category=floral", label: "Floral" },
  { href: "/products?category=amber", label: "Amber" },
];

export function NavbarShell({
  cartCount,
  userSlot,
}: {
  cartCount: number;
  userSlot: ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${
        scrolled
          ? "border-ink/12 bg-parchment/92 backdrop-blur-md"
          : "border-transparent bg-parchment/60 backdrop-blur-[2px]"
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 transition-[height] duration-300 sm:px-8 lg:px-12 ${
          scrolled ? "h-14" : "h-20"
        }`}
      >
        {/* left nav */}
        <nav className="hidden flex-1 items-center gap-9 md:flex">
          {NAV_LINKS.slice(0, 2).map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        {/* center wordmark */}
        <Link
          href="/"
          aria-label="House of Cohort — home"
          className="group flex flex-col items-center"
        >
          <span className="font-display text-[1.35rem] font-light tracking-[0.18em] text-ink transition-colors duration-300 group-hover:text-brand-gold sm:text-[1.6rem]">
            HOUSE OF COHORT
          </span>
          <span
            className={`mt-0.5 text-[9px] uppercase tracking-[0.45em] text-ink/55 transition-opacity duration-300 ${
              scrolled ? "opacity-0" : "opacity-100"
            }`}
          >
            est. Freetown · maison de parfum
          </span>
        </Link>

        {/* right cluster */}
        <div className="flex flex-1 items-center justify-end gap-5 md:gap-7">
          <nav className="hidden md:flex md:items-center md:gap-7">
            {NAV_LINKS.slice(2).map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          {userSlot}

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden text-ink/75 transition-colors hover:text-brand-gold sm:inline-flex"
          >
            <HeartIcon className="size-[18px]" />
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            className="relative inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.3em] text-ink transition-colors hover:text-brand-gold"
          >
            <BagIcon className="size-[18px]" />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && (
              <span className="ml-0.5 inline-flex min-w-[20px] items-center justify-center rounded-full bg-brand-gold px-1.5 text-[10px] font-medium tracking-normal text-ink">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex items-center justify-center gap-6 border-t border-ink/8 px-4 py-2.5 md:hidden">
        {NAV_LINKS.map((link) => (
          <NavLink key={link.href} {...link} compact />
        ))}
      </nav>
    </header>
  );
}

function NavLink({
  href,
  label,
  compact = false,
}: {
  href: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group/nav relative text-ink/75 transition-colors duration-300 hover:text-ink ${
        compact
          ? "text-[10px] uppercase tracking-[0.28em]"
          : "text-[11px] uppercase tracking-[0.34em]"
      }`}
    >
      {label}
      <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-brand-gold transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/nav:origin-left group-hover/nav:scale-x-100" />
    </Link>
  );
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 8h12l-1 12H7L6 8z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V6a3 3 0 016 0v2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
