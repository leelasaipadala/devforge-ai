'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AuroraSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AuroraSkeleton({ className, ...props }: AuroraSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--radius-xl)] bg-primary/5',
        className
      )}
      {...props}
    />
  );
}

export function AuroraPageSkeleton() {
  return (
    <div className="space-y-6">
      <AuroraSkeleton className="h-12 w-1/3 rounded-xl" />
      <AuroraSkeleton className="h-4 w-1/4 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <AuroraSkeleton className="h-40 rounded-xl" />
        <AuroraSkeleton className="h-40 rounded-xl" />
        <AuroraSkeleton className="h-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AuroraSkeleton className="h-64 rounded-xl" />
        <AuroraSkeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
