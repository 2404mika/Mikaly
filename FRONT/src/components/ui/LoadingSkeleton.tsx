const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav skeleton */}
      <div className="h-16 bg-surface-container-low border-b border-outline-variant/20 animate-pulse" />

      {/* Hero skeleton */}
      <div className="relative h-[600px] bg-surface-container animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-8 bg-surface-container-high rounded-lg mb-4" />
          <div className="w-64 h-6 bg-surface-container-high rounded-lg" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-8 py-12">
        <div className="h-8 w-48 bg-surface-container-high rounded-lg mb-8 animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface-container-low rounded-xl overflow-hidden animate-pulse">
              <div className="h-48 bg-surface-container-high" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-surface-container-high rounded w-3/4" />
                <div className="h-4 bg-surface-container-high rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
