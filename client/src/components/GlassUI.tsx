'use client';

import React from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glow';
  glowColor?: 'blue' | 'purple' | 'amber' | 'emerald';
}

export function GlassCard({
  children,
  className = '',
  variant = 'default',
  glowColor = 'purple',
  ...props
}: GlassCardProps) {
  const baseStyles = 'rounded-2xl border transition-all duration-200 backdrop-blur-md';
  const variantStyles = {
    default: 'bg-card/70 border-border hover:border-accent/40',
    elevated: 'bg-secondary/60 border-border/80 shadow-lg shadow-black/20 hover:border-accent/60',
    glow: `bg-card/80 border-${glowColor}-500/30 shadow-lg shadow-${glowColor}-500/10 hover:border-${glowColor}-500/50`,
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassPanel({ children, className = '', ...props }: GlassPanelProps) {
  return (
    <div
      className={`p-6 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-lg shadow-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function GlassButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}: GlassButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none backdrop-blur-sm';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-xs gap-2',
    lg: 'px-6 py-3 text-sm gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 border border-blue-400/30',
    accent:
      'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 border border-purple-400/30',
    secondary:
      'bg-secondary/80 hover:bg-accent text-foreground border border-border shadow-sm',
    danger:
      'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30',
    outline:
      'bg-transparent hover:bg-secondary/50 text-foreground border border-border',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function GlassInput({ label, error, className = '', ...props }: GlassInputProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-xs font-semibold text-muted-foreground">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 rounded-xl bg-secondary/70 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] font-semibold text-red-400">{error}</p>}
    </div>
  );
}

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function GlassModal({ isOpen, onClose, title, children }: GlassModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-card/90 border border-border rounded-2xl p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm font-bold px-2 py-1">
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'purple' | 'emerald' | 'amber' | 'red' | 'neutral';
}

export function GlassBadge({ children, variant = 'blue' }: GlassBadgeProps) {
  const styles = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    neutral: 'bg-secondary text-foreground border-border',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${styles[variant]}`}>
      {children}
    </span>
  );
}

export interface GlassProgressProps {
  value: number;
  max?: number;
  color?: 'blue' | 'purple' | 'emerald' | 'amber';
}

export function GlassProgress({ value, max = 100, color = 'blue' }: GlassProgressProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const barColors = {
    blue: 'bg-blue-500 shadow-blue-500/30',
    purple: 'bg-purple-500 shadow-purple-500/30',
    emerald: 'bg-emerald-500 shadow-emerald-500/30',
    amber: 'bg-amber-500 shadow-amber-500/30',
  };

  return (
    <div className="w-full h-2 rounded-full bg-secondary/80 overflow-hidden p-0.5 border border-border/50">
      <div
        className={`h-full rounded-full transition-all duration-500 shadow-sm ${barColors[color]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
