'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AuroraCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glass?: boolean;
  padded?: boolean;
  glow?: boolean;
  hoverable?: boolean;
}

export function AuroraCard({
  children,
  className,
  glass = false,
  padded = true,
  glow = false,
  hoverable = false,
  ...props
}: AuroraCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-xl)] border border-border shadow-[var(--shadow)] transition-all duration-300',
        glass ? 'bg-white/40 dark:bg-black/40 backdrop-blur-xl' : 'bg-card',
        padded && 'p-5 sm:p-6',
        glow && 'hover:shadow-primary/20 hover:border-primary/30',
        hoverable && 'cursor-pointer hover:-translate-y-1 hover:shadow-xl active:scale-[0.99] active:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
