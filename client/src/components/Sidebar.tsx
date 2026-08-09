'use client';

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
import { ThemeToggle } from './ThemeToggle';
import { DevForgeLogo } from './DevForgeLogo';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'FORGE AI', href: '/ai-coach', icon: Bot, badge: 'Intelligence' },
  { label: 'Skills & Gaps', href: '/skills', icon: BrainCircuit },
  { label: 'Career Roadmap', href: '/roadmap', icon: Map },
  { label: 'Resume ATS', href: '/resume', icon: FileText },
  { label: 'GitHub Profile', href: '/github', icon: Github },
  { label: 'Projects', href: '/projects', icon: FolderGit2 },
  { label: 'Interview Prep', href: '/interview', icon: HelpCircle },
  { label: 'Job Tracker', href: '/jobs', icon: Briefcase },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean; setMobileOpen?: (open: boolean) => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen?.(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <Link href="/dashboard">
              <DevForgeLogo variant="full" size="md" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Career OS</div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen?.(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-muted-foreground'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium border border-purple-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer & User Profile & Logout */}
        <div className="p-3 border-t border-border bg-card/60 space-y-2">
          <div className="flex items-center justify-between px-1">
            <ThemeToggle />
            <Link
              href="/settings"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border border-border"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="flex-1 flex items-center justify-between p-2 rounded-lg bg-secondary/60 hover:bg-accent border border-border transition-colors group"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DF'}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-medium text-foreground truncate">{user?.name || 'Developer'}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{user?.targetRole || 'Developer'}</span>
                </div>
              </div>
            </Link>

            <button
              onClick={signOut}
              className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

