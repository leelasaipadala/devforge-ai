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

  // SVG Abstract Forge Mark Component
  const ForgeMarkIcon = (
    <svg
      className={`${currentDimension} ${className}`}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DevForge AI Mark"
    >
      <defs>
        <linearGradient id="df-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="df-grad-spark" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
      </defs>

      {/* Background Rounded Shield */}
      <rect width="32" height="32" rx="8" fill="url(#df-grad-primary)" fillOpacity="0.15" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="url(#df-grad-primary)" strokeOpacity="0.4" />

      {/* Upward Trajectory + Geometric F Mark */}
      <path
        d="M8 24V8H22M8 15H19"
        stroke="url(#df-grad-primary)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Upward Spark Element */}
      <path
        d="M20 7L24 11M24 11L20 15M24 11H15"
        stroke="url(#df-grad-spark)"
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
        <linearGradient id="ai-spark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#ai-spark-grad)" fillOpacity="0.2" stroke="url(#ai-spark-grad)" strokeWidth="1.5" />
      <path d="M16 6L18.5 13.5L26 16L18.5 18.5L16 26L13.5 18.5L6 16L13.5 13.5L16 6Z" fill="url(#ai-spark-grad)" />
    </svg>
  );

  if (variant === 'forge-ai') {
    return ForgeAiMarkIcon;
  }

  if (variant === 'icon') {
    return ForgeMarkIcon;
  }

  return (
    <div className="flex items-center gap-2.5 group">
      {ForgeMarkIcon}

      <div className="flex flex-col">
        <span className="font-extrabold tracking-tight text-foreground flex items-center gap-1 text-base">
          DevForge
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
            AI
          </span>
        </span>
        {variant === 'full' && (
          <span className="text-[10px] text-muted-foreground font-semibold tracking-wide">
            Career Command Center
          </span>
        )}
      </div>
    </div>
  );
}
