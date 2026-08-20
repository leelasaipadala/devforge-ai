'use client';

import React, { useState } from 'react';
import { Menu, Search, Bot, LogOut, User as UserIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CmdKModal } from './CmdKModal';
import { DevForgeLogo } from './DevForgeLogo';

export const Header = React.memo(function Header({
  onMobileMenuClick,
  readinessScore,
}: {
  onMobileMenuClick?: () => void;
  readinessScore?: number;
}) {
  const [cmdKOpen, setCmdKOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="sticky top-4 z-30 mx-4 lg:mx-8 mb-4 h-16 rounded-2xl bg-card/60 backdrop-blur-xl border border-border shadow-sm flex items-center justify-between px-4 lg:px-6 transition-all duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuClick}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary lg:hidden border border-border/50"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Cmd+K Quick Search Button */}
          <button
            onClick={() => setCmdKOpen(true)}
            className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 text-[13px] text-muted-foreground transition-all w-72 justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Search commands & tools...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-bold bg-background text-muted-foreground rounded-md shadow-sm border border-border/50">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Readiness Score Badge */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-success/10 border border-success/20 text-[13px]">
            <span className="text-muted-foreground font-medium">Readiness</span>
            <span className="font-bold text-success">{readinessScore !== undefined ? `${readinessScore}%` : 'Getting Started'}</span>
          </div>

          {/* FORGE AI Coach Link */}
          <Link
            href="/ai-coach"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ai text-white font-semibold text-[13px] shadow-sm shadow-ai/20 hover:shadow-md hover:shadow-ai/30 transition-all hover:opacity-90 group"
          >
            <DevForgeLogo variant="forge-ai" size="sm" className="opacity-90 group-hover:opacity-100" />
            <span className="hidden sm:inline">FORGE AI</span>
          </Link>

          <div className="w-px h-6 bg-border/80 hidden sm:block mx-1"></div>

          {/* User Profile Snippet */}
          <div className="flex items-center gap-3 pl-1">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 text-[13px] font-semibold text-foreground hover:text-primary transition-colors"
              title="View Profile"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shadow-sm overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : 'DF'
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <CmdKModal isOpen={cmdKOpen} onClose={() => setCmdKOpen(false)} />
    </>
  );
});

