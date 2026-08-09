'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Map,
  FileText,
  FolderGit2,
  HelpCircle,
  Briefcase,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Zap,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { CardSkeleton } from '@/components/Skeletons';
import { ApiClient } from '@/lib/api';
import { Github } from '@/components/Icons';

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res: any = await ApiClient.get('/profile');
        setData(res);
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setData({
          profile: {
            name: 'DevForge Engineer',
            targetRole: 'Full Stack Developer',
            careerGoal: 'Land a Software Engineer Role',
            readinessScore: 78,
          },
          readinessData: {
            overallScore: 78,
            statusCategory: 'Competitive',
            categories: {
              skillsScore: 82,
              resumeScore: 75,
              githubScore: 72,
              projectsScore: 80,
              interviewScore: 70,
            },
            recommendations: [
              'Complete 1 system design mock interview session.',
              'Add Docker and CI/CD to your technical skills inventory.',
            ],
            disclaimer: 'Product-generated career readiness indicator based on profile metrics.',
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
    skillsScore: 80,
    resumeScore: 70,
    githubScore: 65,
    projectsScore: 75,
    interviewScore: 60,
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={() => setMobileOpen(true)} readinessScore={readiness.overallScore || 78} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <>
              {/* Welcome & Goal Banner */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-950/60 via-card to-purple-950/50 border border-border shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>DevForge AI Command Center</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    Welcome back, {profile.name || 'Developer'}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                    Target Role: <strong className="text-foreground">{profile.targetRole || 'Full Stack Developer'}</strong> • Goal:{' '}
                    <span className="text-foreground">{profile.careerGoal || 'Land Software Engineering position'}</span>
                  </p>
                </div>

                <Link
                  href="/ai-coach"
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0"
                >
                  <Bot className="w-4 h-4" />
                  <span>Start FORGE AI Strategy Session</span>
                </Link>
              </div>

              {/* DevForge Career Readiness Score Engine */}
              <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pillar Assessment</span>
                    <h2 className="text-xl font-bold text-foreground mt-1">DevForge Career Readiness Score</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-extrabold text-blue-500">
                      {readiness.overallScore || 78} <span className="text-xs text-muted-foreground font-normal">/ 100</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {readiness.statusCategory || 'Competitive'}
                    </span>
                  </div>
                </div>

                {/* 5 Pillar Breakdown Bar Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-secondary/60 border border-border text-left">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground font-medium">Skills Coverage</span>
                      <span className="font-bold text-blue-500">{categories.skillsScore}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${categories.skillsScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-secondary/60 border border-border text-left">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground font-medium">Resume ATS</span>
                      <span className="font-bold text-purple-500">{categories.resumeScore}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${categories.resumeScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-secondary/60 border border-border text-left">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground font-medium">GitHub Profile</span>
                      <span className="font-bold text-emerald-500">{categories.githubScore}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${categories.githubScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-secondary/60 border border-border text-left">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground font-medium">Portfolio Projects</span>
                      <span className="font-bold text-amber-500">{categories.projectsScore}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${categories.projectsScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-secondary/60 border border-border text-left">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground font-medium">Interview Prep</span>
                      <span className="font-bold text-indigo-500">{categories.interviewScore}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${categories.interviewScore}%` }} />
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground pt-2 border-t border-border">
                  {readiness.disclaimer ||
                    'Product-generated indicator based on profile input metrics. Not an official industry certification.'}
                </div>
              </div>

              {/* Grid Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AI Recommended Daily Action */}
                <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">FORGE AI Daily Recommendation</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">
                      {readiness.recommendations?.[0] ||
                        'Complete 1 mock system design practice on URL Shorteners and upload your latest resume PDF to boost your ATS keyword score to 85+.'}
                    </p>
                  </div>
                  <Link
                    href="/ai-coach"
                    className="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs font-semibold border border-purple-500/30 text-center transition-colors block"
                  >
                    Ask FORGE AI How to Execute
                  </Link>
                </div>

                {/* Skill Gaps Preview */}
                <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">Target Skill Gaps</span>
                    <Link href="/skills" className="text-xs text-blue-500 hover:underline">
                      Manage Skills →
                    </Link>
                  </div>
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-secondary/60 border border-border flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">Docker Containerization</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-semibold border border-amber-500/20">
                        High Priority
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-secondary/60 border border-border flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">System Design Patterns</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-semibold border border-amber-500/20">
                        High Priority
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-secondary/60 border border-border flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">GraphQL API Design</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-semibold border border-blue-500/20">
                        Medium Priority
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Career Actions */}
                <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Quick Actions</span>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/resume"
                      className="p-3 rounded-xl bg-secondary/80 hover:bg-accent border border-border text-xs text-foreground flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-purple-400" />
                      <span>Upload Resume</span>
                    </Link>

                    <Link
                      href="/github"
                      className="p-3 rounded-xl bg-secondary/80 hover:bg-accent border border-border text-xs text-foreground flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
                    >
                      <Github className="w-5 h-5 text-emerald-500" />
                      <span>Audit GitHub</span>
                    </Link>

                    <Link
                      href="/interview"
                      className="p-3 rounded-xl bg-secondary/80 hover:bg-accent border border-border text-xs text-foreground flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
                    >
                      <HelpCircle className="w-5 h-5 text-indigo-500" />
                      <span>Mock Interview</span>
                    </Link>

                    <Link
                      href="/projects"
                      className="p-3 rounded-xl bg-secondary/80 hover:bg-accent border border-border text-xs text-foreground flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
                    >
                      <FolderGit2 className="w-5 h-5 text-amber-500" />
                      <span>New Project</span>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

