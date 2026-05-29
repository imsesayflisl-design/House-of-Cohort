"use client";

import { type ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  /** seconds for one full loop */
  durationSec?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
};

export function Marquee({
  children,
  durationSec = 40,
  reverse = false,
  pauseOnHover = true,
  className = "",
}: MarqueeProps) {
  return (
    <div
      className={`group relative flex w-full overflow-hidden ${className}`}
      style={{
        // soft horizontal mask so labels fade at edges
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        className="flex shrink-0 items-center"
        style={{
          animation: `marquee-scroll ${durationSec}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
          animationPlayState: undefined,
        }}
        data-marquee-track
      >
        {children}
        {children}
      </div>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        ${pauseOnHover ? `.group:hover [data-marquee-track] { animation-play-state: paused; }` : ""}
        @media (prefers-reduced-motion: reduce) {
          [data-marquee-track] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
