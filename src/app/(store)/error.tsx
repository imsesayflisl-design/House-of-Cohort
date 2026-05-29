"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StoreError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-brand-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-serif">Something went wrong</CardTitle>
            <CardDescription className="mt-2">
              We encountered an error while loading this page. Please try again.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="p-3 bg-red-50 rounded-md border border-red-200">
              <p className="text-xs text-red-700 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} variant="default" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            <Button render={<Link href="/" />} variant="outline" className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}