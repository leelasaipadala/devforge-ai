'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Settings,
  Search,
  X,
  PlusCircle,
  SunMoon,
  LogOut,
} from 'lucide-react';
import { Github } from '@/components/Icons';

interface CmdKModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CmdKModal({ isOpen, onClose }: CmdKModalProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { name: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { name: 'Open FORGE AI Coach', path: '/ai-coach', icon: Bot, category: 'AI Intelligence' },
    { name: 'Skills & Gap Analysis', path: '/skills', icon: BrainCircuit, category: 'Career' },
    { name: 'Career Roadmap', path: '/roadmap', icon: Map, category: 'Career' },
    { name: 'Resume ATS Analyzer', path: '/resume', icon: FileText, category: 'Tools' },
    { name: 'GitHub Profile Analyzer', path: '/github', icon: Github, category: 'Tools' },
    { name: 'Portfolio Projects', path: '/projects', icon: FolderGit2, category: 'Portfolio' },
    { name: 'Interview Preparation', path: '/interview', icon: HelpCircle, category: 'Practice' },
    { name: 'Job Application Tracker', path: '/jobs', icon: Briefcase, category: 'Jobs' },
    { name: 'Career Analytics', path: '/analytics', icon: BarChart3, category: 'Analytics' },
    { name: 'Add New Skill', path: '/skills', icon: PlusCircle, category: 'Quick Action' },
    { name: 'Add New Project', path: '/projects', icon: PlusCircle, category: 'Quick Action' },
    { name: 'Add Job Application', path: '/jobs', icon: PlusCircle, category: 'Quick Action' },
    { name: 'Change Theme Settings', path: '/settings', icon: SunMoon, category: 'Settings' },
    { name: 'Account Settings', path: '/settings', icon: Settings, category: 'Account' },
    { name: 'Sign Out / Logout', path: '/', icon: LogOut, category: 'Account' },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden glass-panel">
        <div className="flex items-center px-4 border-b border-zinc-800/80">
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <input
            type="text"
            placeholder="Type a command or search destination... (Ctrl+K)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-4 bg-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none text-sm"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">No commands found matching "{search}"</div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={`${cmd.path}-${idx}`}
                  onClick={() => handleSelect(cmd.path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>{cmd.name}</span>
                  </div>
                  <span className="text-xs text-zinc-500 border border-zinc-800 rounded px-1.5 py-0.5">{cmd.category}</span>
                </button>
              );
            })
          )}
        </div>
        <div className="px-4 py-2 border-t border-zinc-800/60 bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-500">
          <span>Navigate with click or search</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
}
