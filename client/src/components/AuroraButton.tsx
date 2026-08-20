'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type AuroraButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai' | 'success' | 'warning';

interface AuroraButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AuroraButtonVariant;
  isLoading?: boolean;
}

export function AuroraButton({
  children,
  className,
  variant = 'primary',
  isLoading,
  disabled,
  ...props
}: AuroraButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none px-4 py-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary shadow-sm',
    secondary: 'bg-secondary text-foreground hover:bg-secondary/80 focus:ring-secondary',
    outline: 'border border-border bg-transparent hover:bg-secondary text-foreground',
    ghost: 'bg-transparent hover:bg-secondary text-foreground',
    danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger shadow-sm',
    success: 'bg-success text-white hover:bg-success/90 focus:ring-success shadow-sm',
    warning: 'bg-warning text-white hover:bg-warning/90 focus:ring-warning shadow-sm',
    ai: 'bg-gradient-to-r from-ai to-secondary-accent text-white hover:opacity-90 shadow-md focus:ring-ai',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}
