import React from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80 ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="flex items-center gap-3.5">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-9 w-24 rounded-full" />
    </div>
  );
}
