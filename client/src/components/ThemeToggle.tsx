'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-32 h-9 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
    );
  }

  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
      <button
        onClick={() => setTheme('light')}
        className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
          theme === 'light'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Light</span>
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
          theme === 'dark'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Dark</span>
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
          theme === 'system'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Monitor className="w-3.5 h-3.5" />
        <span>System</span>
      </button>
    </div>
  );
}
