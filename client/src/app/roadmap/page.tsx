'use client';

import {useState, useEffect, useCallback} from 'react';
import Link from 'next/link';
import { Map, CheckCircle2, Circle, Clock, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { AuroraCard } from '@/components/AuroraCard';
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraBadge } from '@/components/AuroraBadge';
import { AuroraProgress } from '@/components/AuroraProgress';

export default function RoadmapPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadRoadmap();
    }
  }, [authLoading, isAuthenticated]);

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
  const handleMobileMenuClick = useCallback(() => setMobileOpen(true), []);


  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={handleMobileMenuClick} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-primary uppercase mb-2">
                <Map className="w-4 h-4" />
                <span>Career Architecture</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {roadmap?.title || 'Phased Career Roadmap'}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                {roadmap?.description || 'Your personalized step-by-step career path tailored to your goal.'}
              </p>
            </div>

            <AuroraButton
              onClick={handleRegenerate}
              disabled={generating}
              variant="ai"
              className="gap-2 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generating AI Roadmap...' : 'Generate Roadmap'}</span>
            </AuroraButton>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-[13px] font-medium text-danger flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Roadmap Loading / Empty State / Content */}
          {loading ? (
            <div className="p-16 text-center">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-[14px] text-muted-foreground font-medium">Loading career roadmap...</p>
            </div>
          ) : roadmap?.phases && roadmap.phases.length > 0 ? (
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {roadmap.phases.map((phase: any, index: number) => (
                <div key={phase.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  {/* Timeline Node */}
                  <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-background bg-secondary text-primary font-bold z-10 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                    {index + 1}
                  </div>
                  
                  {/* Phase Card */}
                  <AuroraCard className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] space-y-5 hover:border-primary/40 transition-colors">
                    <div className="flex flex-col gap-2 border-b border-border/50 pb-4">
                      <div className="flex items-center justify-between">
                        <AuroraBadge variant={phase.completion === 100 ? 'success' : 'primary'} className="uppercase tracking-wide">
                          Phase {index + 1}
                        </AuroraBadge>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{phase.estimatedEffort || '3 weeks'}</span>
                        </div>
                      </div>
                      <h2 className="text-lg font-bold text-foreground">{phase.title}</h2>
                      <p className="text-[13px] text-muted-foreground font-medium leading-relaxed">{phase.description}</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{phase.completion || 0}%</span>
                      </div>
                      <AuroraProgress 
                        value={phase.completion || 0} 
                        colorVariant={phase.completion === 100 ? 'success' : 'primary'} 
                      />
                    </div>

                    {/* Skills & Topics Badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {phase.skills?.map((sk: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-secondary text-foreground text-[11px] font-semibold border border-border/50 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-ai" />
                          {sk}
                        </span>
                      ))}
                    </div>

                    {/* Phase Action Items Checkboxes */}
                    <div className="space-y-2 pt-3 border-t border-border/50">
                      {phase.items?.map((item: any) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItem(phase.id, item.id, item.completed)}
                          className="p-3 rounded-xl bg-secondary/30 border border-transparent hover:border-border hover:bg-secondary transition-all flex items-center justify-between cursor-pointer group/item"
                        >
                          <div className="flex items-start gap-3">
                            {item.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground group-hover/item:text-foreground shrink-0 mt-0.5" />
                            )}
                            <span className={`text-[13px] font-medium leading-relaxed ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {item.title}
                            </span>
                          </div>
                          {item.estimatedHours && (
                            <span className="text-[10px] text-muted-foreground font-mono font-bold bg-background px-1.5 py-0.5 rounded ml-2 shrink-0 border border-border/50">
                              {item.estimatedHours}h
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </AuroraCard>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <AuroraCard className="flex flex-col items-center justify-center text-center space-y-5 max-w-xl mx-auto my-12 py-12 border-dashed border-2">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                <Map className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">No roadmap yet</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed max-w-sm mx-auto font-medium">
                  Complete your career setup to generate your personalized learning roadmap.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-4">
                <Link href="/settings">
                  <AuroraButton variant="secondary">
                    Complete Setup
                  </AuroraButton>
                </Link>
                <AuroraButton
                  onClick={handleRegenerate}
                  disabled={generating}
                  variant="ai"
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Roadmap</span>
                </AuroraButton>
              </div>
            </AuroraCard>
          )}
        </main>
      </div>
    </div>
  );
}
