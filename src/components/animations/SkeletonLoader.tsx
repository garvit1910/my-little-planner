import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonLoaderProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-muted shimmer',
        className
      )}
    />
  );
}

export function TaskSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border bg-card">
      <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-24 mb-4" />
      {[...Array(count)].map((_, i) => (
        <TaskSkeleton key={i} />
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-10" />
        ))}
        {[...Array(35)].map((_, i) => (
          <Skeleton key={`cell-${i}`} className="h-24" />
        ))}
      </div>
    </div>
  );
}