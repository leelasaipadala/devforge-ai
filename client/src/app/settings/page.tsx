'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Key, Download, Trash2, Shield, Bot } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [clerkKey, setClerkKey] = useState('');

  const handleExportData = () => {
    const data = {
      user: 'DevForge Engineer',
      exportedAt: new Date().toISOString(),
      platform: 'DevForge AI Career Command Center',
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devforge-career-data.json';
    a.click();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <SettingsIcon className="w-4 h-4" />
              <span>Platform Configuration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Theme & Appearance */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Appearance & Design Theme</span>
              </h2>
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>Toggle Dark / Light Theme Mode</span>
                <ThemeToggle />
              </div>
            </div>

            {/* AI Preferences */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>AI & Service API Keys</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                DevForge AI is pre-configured with active intelligent services. You can also provide custom Google Gemini or Clerk API keys via environment configuration.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Google Gemini API Key</label>
                  <input
                    type="password"
                    placeholder="AIzaSy... (configured in .env)"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* Data Export & Account */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Data Privacy & Export</span>
              </h2>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <div>
                  <div className="text-xs font-bold text-zinc-200">Export Career Data JSON</div>
                  <div className="text-[11px] text-zinc-500">Download all your skills, roadmap items, projects, and interview records.</div>
                </div>
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
