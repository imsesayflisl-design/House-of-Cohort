import type { Metadata } from "next";
import { Cormorant_Garamond, Fraunces, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "House of Cohort — Luxury Fragrance, Freetown",
  description:
    "Hand-blended fragrances inspired by Sierra Leone's heritage — an archive of scent for the discerning.",
  verification: {
    google: "FAfA3TD3QnAVC86NZv0CflrHYxTNdq6VD6OUlOvblvc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${fraunces.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased min-h-screen bg-parchment text-ink selection:bg-brand-gold/30 selection:text-ink">
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors closeButton position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
