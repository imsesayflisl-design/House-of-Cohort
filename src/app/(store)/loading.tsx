import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-white">
      {/* Hero skeleton */}
      <div className="h-screen flex items-center justify-center bg-brand-black">
        <div className="text-center space-y-8">
          <Skeleton className="h-16 w-80 mx-auto bg-brand-gold/20" />
          <Skeleton className="h-6 w-64 mx-auto bg-white/20" />
          <Skeleton className="h-12 w-48 mx-auto bg-brand-gold/30" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        {/* Notes marquee skeleton */}
        <div className="py-8">
          <Skeleton className="h-8 w-full bg-brand-gold/20" />
        </div>

        {/* Featured products skeleton */}
        <div className="space-y-8">
          <div className="text-center">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-1/3" />
              </div>
            ))}
          </div>
        </div>

        {/* Categories skeleton */}
        <div className="space-y-8">
          <Skeleton className="h-10 w-48 mx-auto" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}