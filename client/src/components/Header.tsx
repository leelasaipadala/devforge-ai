'use client';

import { useState } from 'react';
import { Menu, Search, Bot, LogOut, User as UserIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CmdKModal } from './CmdKModal';
import { DevForgeLogo } from './DevForgeLogo';

export function Header({
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
      <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-8 flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuClick}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent lg:hidden border border-border"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Cmd+K Quick Search Button */}
          <button
            onClick={() => setCmdKOpen(true)}
            className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-secondary/80 hover:bg-accent border border-border text-xs text-muted-foreground transition-colors w-64 justify-between"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Search commands & tools...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground rounded font-mono border border-border">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Readiness Score Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs">
            <span className="text-muted-foreground">Readiness:</span>
            <span className="font-bold text-blue-500">{readinessScore !== undefined ? `${readinessScore}/100` : 'Active'}</span>
          </div>

          {/* FORGE AI Coach Link */}
          <Link
            href="/ai-coach"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium text-xs shadow-md shadow-blue-500/10 transition-all"
          >
            <DevForgeLogo variant="forge-ai" size="sm" />
            <span className="hidden md:inline">FORGE AI</span>
          </Link>

          {/* User Profile Snippet & Logout */}
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 text-xs font-medium text-foreground hover:text-blue-500 transition-colors"
              title="View Profile"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DF'}
              </div>
              <span className="hidden md:inline max-w-[100px] truncate">{user?.name || 'Developer'}</span>
            </Link>

            <button
              onClick={signOut}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <CmdKModal isOpen={cmdKOpen} onClose={() => setCmdKOpen(false)} />
    </>
  );
}

