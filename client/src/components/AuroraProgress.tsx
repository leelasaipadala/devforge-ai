'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AuroraProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  colorVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ai';
  showLabel?: boolean;
}

export function AuroraProgress({
  value,
  className,
  colorVariant = 'primary',
  showLabel = false,
  ...props
}: AuroraProgressProps) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  const colorStyles = {
    primary: 'bg-primary',
    secondary: 'bg-secondary-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    ai: 'bg-ai',
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      {showLabel && (
        <div className="flex justify-end mb-1 text-xs font-semibold">
          <span>{safeValue}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-secondary overflow-hidden rounded-full border border-border/50">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-out', colorStyles[colorVariant])}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
