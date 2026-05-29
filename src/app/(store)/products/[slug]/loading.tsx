import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-brand-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image gallery skeleton */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <Skeleton className="w-full h-full" />
            </div>

            {/* Thumbnail images */}
            <div className="flex gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="w-20 h-20 rounded-lg overflow-hidden">
                  <Skeleton className="w-full h-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Product info skeleton */}
          <div className="space-y-8">
            {/* Category and title */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-3/4" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Variant selector */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-12" />
              <div className="flex gap-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-12 w-20" />
                ))}
              </div>
            </div>

            {/* Price and stock */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-12" />
            </div>

            {/* Reviews section header */}
            <div className="border-t pt-8 space-y-4">
              <Skeleton className="h-8 w-32" />

              {/* Star distribution */}
              <div className="space-y-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 flex-1" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>

              {/* Individual reviews */}
              <div className="space-y-6">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}