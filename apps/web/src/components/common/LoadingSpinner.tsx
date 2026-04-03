'use client';

/**
 * LoadingSpinner Component
 * Global loading indicator shown during data fetching or page transitions
 */
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 border-4 border-muted rounded-full animate-spin border-t-primary"></div>

        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
