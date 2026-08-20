'use client';

import {useState, useEffect, useCallback} from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  FileText,
  FolderGit2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { CardSkeleton } from '@/components/Skeletons';
import { ApiClient } from '@/lib/api';
import { Github } from '@/components/Icons';
import { AuroraCard } from '@/components/AuroraCard';
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraBadge } from '@/components/AuroraBadge';
import { AuroraProgress } from '@/components/AuroraProgress';
import { AuroraAIOrb } from '@/components/AuroraAIOrb';

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res: any = await ApiClient.get('/profile');
        setData(res);
      } catch (err: any) {
        console.warn('Failed to load profile data, falling back to local data:', err?.message || 'Unknown error');
        setData({
          profile: {
            name: 'DevForge Engineer',
            targetRole: 'Full Stack Developer',
            careerGoal: 'Land a Software Engineer Role',
          },
          readinessData: {
            overallScore: 0,
            statusCategory: 'Getting Started',
            categories: {
              skillsScore: 0,
              resumeScore: 0,
              githubScore: 0,
              projectsScore: 0,
              interviewScore: 0,
            },
            recommendations: [
              'Complete your profile setup to generate your career readiness score.',
              'Upload your resume or connect GitHub to get started.',
            ],
            disclaimer: 'Complete your profile to generate your official readiness score.',
          },
        });
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const profile = data?.profile || {};
  const readiness = data?.readinessData || {};
  const categories = readiness.categories || {
    skillsScore: 0,
    resumeScore: 0,
    githubScore: 0,
    projectsScore: 0,
    interviewScore: 0,
  };
  const handleMobileMenuClick = useCallback(() => setMobileOpen(true), []);


  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={handleMobileMenuClick} readinessScore={readiness.overallScore || undefined} />

        <main className="px-4 sm:px-6 lg:px-8 pb-8 space-y-6 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <>
              <header className="mb-8 mt-2">
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-primary uppercase mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Career Command Center</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  Build the career you're becoming.
                </h1>
                <p className="text-sm text-muted-foreground mt-3 max-w-2xl font-medium leading-relaxed">
                  Welcome back, <strong className="text-foreground">{profile.name || 'Developer'}</strong>. 
                  Targeting: <strong className="text-foreground">{profile.targetRole || 'Full Stack Developer'}</strong>
                </p>
              </header>

              {/* Bento Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* DevForge AI Insight Panel - Prominent */}
                <AuroraCard className="md:col-span-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-ai/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  
                  <div className="shrink-0 relative z-10">
                    <AuroraAIOrb size="lg" active={true} />
                  </div>
                  
                  <div className="flex-1 space-y-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AuroraBadge variant="ai">FORGE AI INSIGHT</AuroraBadge>
                      </div>
                      <p className="text-foreground font-medium text-[15px] leading-relaxed">
                        {readiness.recommendations?.[0] ||
                          'I recommend completing 1 mock system design practice on URL Shorteners and uploading your latest resume PDF to boost your ATS keyword score.'}
                      </p>
                    </div>
                    <Link href="/ai-coach">
                      <AuroraButton variant="ai" className="gap-2 text-[13px] rounded-full px-5 shadow-ai/10">
                        <Bot className="w-4 h-4" /> Start Strategy Session
                      </AuroraButton>
                    </Link>
                  </div>
                </AuroraCard>

                {/* Overall Readiness Score */}
                <AuroraCard className="md:col-span-4 flex flex-col justify-center items-center text-center space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Overall Readiness</span>
                  <div className="text-5xl font-extrabold tracking-tighter text-foreground">
                    {readiness.overallScore ?? 0}<span className="text-xl text-muted-foreground font-medium">/100</span>
                  </div>
                  <AuroraBadge variant="success" className="px-3 py-1 text-[11px]">
                    {readiness.statusCategory || 'Getting Started'}
                  </AuroraBadge>
                </AuroraCard>

                {/* 5 Pillar Breakdown Bar Gauges */}
                <AuroraCard className="md:col-span-12 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Pillar Assessment</h2>
                    <Link href="/roadmap" className="text-[13px] font-semibold text-primary hover:underline">View Roadmap →</Link>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-semibold text-muted-foreground">Skills</span>
                        <span className="font-bold text-foreground">{categories.skillsScore}%</span>
                      </div>
                      <AuroraProgress value={categories.skillsScore} colorVariant="primary" />
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-semibold text-muted-foreground">Resume</span>
                        <span className="font-bold text-foreground">{categories.resumeScore}%</span>
                      </div>
                      <AuroraProgress value={categories.resumeScore} colorVariant="secondary" className="[&>div>div]:bg-secondary-accent" />
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-semibold text-muted-foreground">GitHub</span>
                        <span className="font-bold text-foreground">{categories.githubScore}%</span>
                      </div>
                      <AuroraProgress value={categories.githubScore} colorVariant="success" />
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-semibold text-muted-foreground">Projects</span>
                        <span className="font-bold text-foreground">{categories.projectsScore}%</span>
                      </div>
                      <AuroraProgress value={categories.projectsScore} colorVariant="warning" />
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-semibold text-muted-foreground">Interviews</span>
                        <span className="font-bold text-foreground">{categories.interviewScore}%</span>
                      </div>
                      <AuroraProgress value={categories.interviewScore} colorVariant="danger" />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground font-medium">
                    {readiness.disclaimer || 'Product-generated indicator based on profile input metrics.'}
                  </div>
                </AuroraCard>

                {/* Skill Gaps Preview */}
                <AuroraCard className="md:col-span-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Priority Skill Gaps</span>
                    <Link href="/skills" className="text-[12px] font-semibold text-primary hover:underline">
                      Manage →
                    </Link>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-between">
                      <span className="text-[13px] font-semibold">Docker Containerization</span>
                      <AuroraBadge variant="warning">High Priority</AuroraBadge>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-between">
                      <span className="text-[13px] font-semibold">System Design Patterns</span>
                      <AuroraBadge variant="warning">High Priority</AuroraBadge>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-between">
                      <span className="text-[13px] font-semibold">GraphQL API Design</span>
                      <AuroraBadge variant="primary">Medium Priority</AuroraBadge>
                    </div>
                  </div>
                </AuroraCard>

                {/* Quick Career Actions */}
                <AuroraCard className="md:col-span-6 space-y-5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Quick Actions</span>
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/resume"
                      className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 flex flex-col items-center justify-center text-center gap-2.5 transition-colors group"
                    >
                      <div className="p-2 rounded-full bg-background group-hover:bg-primary/10 transition-colors">
                        <FileText className="w-5 h-5 text-primary" strokeWidth={2.5} />
                      </div>
                      <span className="text-[13px] font-semibold">Upload Resume</span>
                    </Link>

                    <Link
                      href="/github"
                      className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 flex flex-col items-center justify-center text-center gap-2.5 transition-colors group"
                    >
                      <div className="p-2 rounded-full bg-background group-hover:bg-success/10 transition-colors">
                        <Github className="w-5 h-5 text-success" />
                      </div>
                      <span className="text-[13px] font-semibold">Audit GitHub</span>
                    </Link>

                    <Link
                      href="/interview"
                      className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 flex flex-col items-center justify-center text-center gap-2.5 transition-colors group"
                    >
                      <div className="p-2 rounded-full bg-background group-hover:bg-secondary-accent/10 transition-colors">
                        <HelpCircle className="w-5 h-5 text-secondary-accent" strokeWidth={2.5} />
                      </div>
                      <span className="text-[13px] font-semibold">Mock Interview</span>
                    </Link>

                    <Link
                      href="/projects"
                      className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 flex flex-col items-center justify-center text-center gap-2.5 transition-colors group"
                    >
                      <div className="p-2 rounded-full bg-background group-hover:bg-warning/10 transition-colors">
                        <FolderGit2 className="w-5 h-5 text-warning" strokeWidth={2.5} />
                      </div>
                      <span className="text-[13px] font-semibold">New Project</span>
                    </Link>
                  </div>
                </AuroraCard>

              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
