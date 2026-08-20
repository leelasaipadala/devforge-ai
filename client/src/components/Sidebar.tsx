'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Bot,
  BrainCircuit,
  Map,
  FileText,
  FolderGit2,
  HelpCircle,
  Briefcase,
  BarChart3,
  User,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { Github } from '@/components/Icons';
import { DevForgeLogo } from './DevForgeLogo';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Command Center',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'FORGE AI', href: '/ai-coach', icon: Bot, badge: 'Intelligence' },
    ],
  },
  {
    title: 'Career Intelligence',
    items: [
      { label: 'Skills & Gaps', href: '/skills', icon: BrainCircuit },
      { label: 'Career Roadmap', href: '/roadmap', icon: Map },
      { label: 'Resume ATS', href: '/resume', icon: FileText },
      { label: 'GitHub Profile', href: '/github', icon: Github },
      { label: 'Projects', href: '/projects', icon: FolderGit2 },
    ],
  },
  {
    title: 'Preparation',
    items: [
      { label: 'Interview Prep', href: '/interview', icon: HelpCircle },
      { label: 'Job Tracker', href: '/jobs', icon: Briefcase },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
];

export const Sidebar = React.memo(function Sidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen?.(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-card/80 backdrop-blur-xl border-r border-border flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-border/50">
            <Link href="/dashboard" className="transition-opacity hover:opacity-80">
              <DevForgeLogo variant="full" size="md" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <div className="px-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen?.(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all group ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide border ${isActive ? 'bg-ai/10 text-ai border-ai/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer & User Profile & Logout */}
        <div className="p-4 border-t border-border/50 bg-secondary/30 shrink-0 space-y-3">
          <div className="flex items-center justify-end px-1">
            <Link
              href="/settings"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="flex-1 flex items-center justify-between p-2 rounded-xl bg-card hover:bg-secondary border border-border/50 transition-colors group"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0 overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'DF'
                  )}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[13px] font-semibold text-foreground truncate">{user?.name || 'Developer'}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{user?.targetRole || 'Developer'}</span>
                </div>
              </div>
            </Link>

            <button
              onClick={signOut}
              className="p-2.5 rounded-xl bg-danger/5 hover:bg-danger/10 text-danger border border-danger/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
});

