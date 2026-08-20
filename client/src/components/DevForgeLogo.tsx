'use client';

import React from 'react';

export interface DevForgeLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'forge-ai';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function DevForgeLogo({
  variant = 'full',
  size = 'md',
  className = '',
}: DevForgeLogoProps) {
  const iconDimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const currentDimension = iconDimensions[size];

  // SVG Abstract Forge Mark Component (Aurora Atelier: Geometric D + Upward trajectory)
  const ForgeMarkIcon = (
    <svg
      className={`${currentDimension} ${className}`}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DevForge AI Mark"
    >
      <defs>
        <linearGradient id="aurora-grad-primary" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-ai)" />
        </linearGradient>
      </defs>

      {/* Abstract D shape */}
      <path
        d="M6 6H14C20.6274 6 26 11.3726 26 18C26 24.6274 20.6274 30 14 30H6V6Z"
        fill="url(#aurora-grad-primary)"
        fillOpacity="0.15"
        stroke="url(#aurora-grad-primary)"
        strokeWidth="2"
      />
      
      {/* Upward trajectory arrow */}
      <path
        d="M11 21L21 11M21 11H14M21 11V18"
        stroke="url(#aurora-grad-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const ForgeAiMarkIcon = (
    <svg
      className={`${currentDimension} ${className}`}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FORGE AI Icon"
    >
      <defs>
        <radialGradient id="aurora-ai-orb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-ai)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--color-secondary-accent)" stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#aurora-ai-orb)" />
      <circle cx="16" cy="16" r="14" stroke="var(--color-ai)" strokeWidth="1" strokeOpacity="0.5" />
      <path d="M16 8L18 14L24 16L18 18L16 24L14 18L8 16L14 14L16 8Z" fill="white" fillOpacity="0.9" />
    </svg>
  );

  if (variant === 'forge-ai') {
    return ForgeAiMarkIcon;
  }

  if (variant === 'icon') {
    return ForgeMarkIcon;
  }

  return (
    <div className="flex items-center gap-3 group">
      {ForgeMarkIcon}

      <div className="flex flex-col">
        <span className="font-extrabold tracking-tight text-foreground flex items-center gap-1.5 text-base">
          DevForge
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-ai/10 text-ai font-bold border border-ai/20">
            AI
          </span>
        </span>
        {variant === 'full' && (
          <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
            Career Intelligence Engine
          </span>
        )}
      </div>
    </div>
  );
}
