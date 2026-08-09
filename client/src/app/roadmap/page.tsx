'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Map, CheckCircle2, Circle, Clock, Sparkles, RefreshCw, AlertCircle, Plus } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';

export default function RoadmapPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadRoadmap();
  }, []);

  async function loadRoadmap() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res: any = await ApiClient.get('/roadmap');
      setRoadmap(res.roadmap || null);
    } catch (err: any) {
      console.error('Error loading roadmap:', err);
      setErrorMsg(err.message || 'Unable to connect to Roadmap service.');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleItem = async (phaseId: string, itemId: string, currentCompleted: boolean) => {
    try {
      const updated = !currentCompleted;
      const res: any = await ApiClient.post('/roadmap/item/toggle', { phaseId, itemId, completed: updated });
      if (res.roadmap) setRoadmap(res.roadmap);
    } catch (err) {
      console.error('Error toggling item:', err);
    }
  };

  const handleRegenerate = async () => {
    setGenerating(true);
    setErrorMsg(null);
    try {
      const res: any = await ApiClient.post('/roadmap/generate', {});
      if (res.roadmap) setRoadmap(res.roadmap);
    } catch (err: any) {
      console.error('Error generating roadmap:', err);
      setErrorMsg(err.message || 'Error generating career roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-500">
                <Map className="w-4 h-4" />
                <span>Phased Career Roadmap</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {roadmap?.title || 'Developer Career Roadmap'}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {roadmap?.description || 'Personalized step-by-step career path tailored to your goal.'}
              </p>
            </div>

            <button
              onClick={handleRegenerate}
              disabled={generating}
              className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 font-semibold text-xs flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generating AI Roadmap...' : 'Generate Roadmap'}</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Roadmap Loading / Empty State / Content */}
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">Loading career roadmap...</div>
          ) : roadmap?.phases && roadmap.phases.length > 0 ? (
            <div className="space-y-6">
              {roadmap.phases.map((phase: any, index: number) => (
                <div
                  key={phase.id || index}
                  className="p-6 rounded-2xl bg-card border border-border space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase">
                          Phase {index + 1}
                        </span>
                        <h2 className="text-lg font-bold text-foreground">{phase.title}</h2>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{phase.estimatedEffort || '3 weeks'}</span>
                      </div>
                      <span className="font-bold text-blue-500">{phase.completion || 0}% Complete</span>
                    </div>
                  </div>

                  {/* Skills & Topics Badges */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {phase.skills?.map((sk: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-xs border border-border">
                        ⚡ {sk}
                      </span>
                    ))}
                  </div>

                  {/* Phase Action Items Checkboxes */}
                  <div className="space-y-2 pt-2">
                    {phase.items?.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem(phase.id, item.id, item.completed)}
                        className="p-3 rounded-xl bg-secondary/60 border border-border hover:bg-accent transition-colors flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0" />
                          )}
                          <span className={`text-xs ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {item.title}
                          </span>
                        </div>
                        {item.estimatedHours && (
                          <span className="text-[10px] text-muted-foreground font-mono">{item.estimatedHours}h est</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-4 max-w-lg mx-auto my-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mx-auto">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">No roadmap yet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Complete your career setup to generate your personalized learning roadmap.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href="/onboarding"
                  className="px-4 py-2 rounded-xl bg-secondary hover:bg-accent text-xs font-semibold text-foreground border border-border"
                >
                  Complete Setup
                </Link>
                <button
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Roadmap</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

