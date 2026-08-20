'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type AuroraBadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ai';

interface AuroraBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: AuroraBadgeVariant;
}

export function AuroraBadge({
  children,
  className,
  variant = 'default',
  ...props
}: AuroraBadgeProps) {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary text-muted-foreground border-border/50',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    ai: 'bg-ai/10 text-ai border-ai/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
