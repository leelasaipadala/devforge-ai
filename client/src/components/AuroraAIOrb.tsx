'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuroraAIOrbProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export function AuroraAIOrb({ className, size = 'md', active = false }: AuroraAIOrbProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
  };

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size], className)}>
      {/* Outer Glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-ai/20 blur-xl"
        animate={{
          scale: active ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: active ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: active ? 2 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Core */}
      <motion.div
        className="absolute inset-2 rounded-full bg-gradient-to-br from-ai/80 to-secondary-accent/80 backdrop-blur-sm shadow-inner shadow-white/30"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Center Light */}
      <div className="absolute inset-[30%] rounded-full bg-white/40 blur-sm" />
    </div>
  );
}
