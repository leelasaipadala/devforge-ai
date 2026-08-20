'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DevForgeLogo } from '@/components/DevForgeLogo';
import { Code2, Terminal, Cpu } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Left Panel - Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-secondary/10 items-center justify-center overflow-hidden border-r border-border">
        {/* Abstract Background Elements with Organic Movement */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1], 
            rotate: [0, 45, -45, 0],
            x: [0, 20, -20, 0],
            y: [0, -30, 20, 0] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1], 
            rotate: [0, -45, 45, 0],
            x: [0, -30, 20, 0],
            y: [0, 20, -20, 0] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" 
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 max-w-lg p-12 w-full space-y-12">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 group">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <DevForgeLogo variant="full" size="xl" />
            </motion.div>
          </Link>

          {/* Value Proposition */}
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70"
            >
              Your Career <br />
              <span className="text-primary">Command Center</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-md"
            >
              Elevate your engineering journey with AI-driven mock interviews, personalized roadmaps, and intelligent resume building.
            </motion.p>
          </div>

          {/* Feature Highlights */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
            className="grid grid-cols-1 gap-6 pt-8 border-t border-border/50"
          >
            <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all group-hover:scale-110">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">AI Mock Interviews</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Practice with adaptive technical challenges.</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all group-hover:scale-110">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Smart Resumes</h3>
                <p className="text-xs text-muted-foreground mt-0.5">ATS-optimized resumes tailored to the job.</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all group-hover:scale-110">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Skill Roadmaps</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Personalized paths to master modern tech stacks.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form (Full width on Mobile) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        {/* Mobile Logo (Only visible on small screens) */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Link href="/">
            <DevForgeLogo variant="full" size="md" />
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="w-full max-w-[440px] space-y-8 mt-12 lg:mt-0"
        >
          <div className="space-y-2 lg:text-left text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          
          <div className="bg-card/50 border border-border shadow-2xl rounded-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
            {/* Subtle top highlight for the card */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
