import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-brand-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar skeleton */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="space-y-6 sticky top-8">
              {/* Categories filter */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-20" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Price filter */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>

              {/* Apply button */}
              <Skeleton className="h-10 w-full" />
            </div>
          </aside>

          {/* Products grid */}
          <main className="flex-1">
            {/* Header and sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>

            {/* Products grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="group">
                  <div className="space-y-4">
                    {/* Product image */}
                    <div className="aspect-square relative overflow-hidden rounded-lg">
                      <Skeleton className="w-full h-full" />
                    </div>

                    {/* Product info */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-5 w-24" />
                    </div>

                    {/* Action button */}
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <Skeleton className="h-10 w-20" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-10 w-10" />
                ))}
              </div>
              <Skeleton className="h-10 w-20" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}