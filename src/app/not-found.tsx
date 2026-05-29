import Link from "next/link";
import { Search, Home, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-white flex items-center justify-center px-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="space-y-6">
          <div className="mx-auto w-20 h-20 bg-brand-black/5 rounded-full flex items-center justify-center">
            <Search className="h-10 w-10 text-brand-black/40" />
          </div>
          <div>
            <CardTitle className="text-2xl font-serif text-brand-black">
              Page Not Found
            </CardTitle>
            <p className="text-brand-black/60 mt-3 leading-relaxed">
              The fragrance you&apos;re looking for seems to have vanished into thin air.
              Let&apos;s help you find your perfect scent.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button render={<Link href="/products" />} variant="default" className="flex-1">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
            <Button render={<Link href="/" />} variant="outline" className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>

          <div className="pt-6 border-t border-brand-black/10">
            <p className="text-sm text-brand-black/50">
              Lost? Our{" "}
              <Link href="/" className="text-brand-gold hover:underline font-medium">
                featured collection
              </Link>{" "}
              might inspire you.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}