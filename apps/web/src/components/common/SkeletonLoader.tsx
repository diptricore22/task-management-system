'use client';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'card' | 'list' | 'table' | 'inline';
  height?: string;
  width?: string;
}

/**
 * SkeletonLoader Component
 * Shows placeholder skeleton content while data is loading
 * Improves perceived performance compared to blank space
 */
export function SkeletonLoader({
  count = 1,
  type = 'card',
  height = 'h-4',
  width = 'w-full',
}: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count });

  const baseClass = 'bg-muted rounded animate-pulse';

  const renderSkeleton = (index: number) => {
    switch (type) {
      case 'card':
        return (
          <div key={index} className="p-4 border border-border rounded-lg space-y-3">
            <div className={`${baseClass} h-8 w-2/3`}></div>
            <div className={`${baseClass} h-4 w-full`}></div>
            <div className={`${baseClass} h-4 w-5/6`}></div>
            <div className="flex gap-2 pt-2">
              <div className={`${baseClass} h-8 w-24`}></div>
              <div className={`${baseClass} h-8 w-24`}></div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div key={index} className="flex gap-4 py-3 border-b border-border">
            <div className={`${baseClass} h-10 w-10 rounded-full flex-shrink-0`}></div>
            <div className="flex-1 space-y-2">
              <div className={`${baseClass} h-4 w-1/2`}></div>
              <div className={`${baseClass} h-3 w-full`}></div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div key={index} className="flex gap-4 py-3 border-b border-border">
            <div className={`${baseClass} h-4 w-1/4`}></div>
            <div className={`${baseClass} h-4 w-1/4`}></div>
            <div className={`${baseClass} h-4 w-1/4`}></div>
            <div className={`${baseClass} h-4 w-1/4`}></div>
          </div>
        );

      case 'inline':
      default:
        return <div key={index} className={`${baseClass} ${height} ${width}`}></div>;
    }
  };

  return <>{skeletons.map((_, index) => renderSkeleton(index))}</>;
}
