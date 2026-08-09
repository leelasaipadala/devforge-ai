'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Award,
  Activity as ActivityIcon,
  Briefcase,
  FolderGit2,
  BrainCircuit,
  MapPin,
  RefreshCw,
  PlusCircle,
  PlayCircle,
  FileCheck,
  Zap,
  LogIn,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  CartesianGrid,
} from 'recharts';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface AnalyticsData {
  readinessScore: {
    current: number | null;
    breakdown: {
      skillsScore: number;
      resumeScore: number;
      githubScore: number;
      projectsScore: number;
      interviewScore: number;
      learningScore: number;
    };
    history: Array<{
      date: string;
      overallScore: number;
      skillsScore?: number;
      resumeScore?: number;
      projectsScore?: number;
    }>;
  };
  skills: {
    total: number;
    mastered: number;
    averageProficiency: number | null;
    categoryBreakdown: Array<{
      category: string;
      count: number;
      avgProficiency: number;
    }>;
  };
  roadmap: {
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    learningHours: number;
    progress: Array<{
      phase: string;
      completed: number;
      total: number;
      percentage: number;
    }>;
  };
  interviews: {
    totalSessions: number;
    averageScore: number | null;
    bestScore: number | null;
    performance: Array<{
      category: string;
      score: number;
      count: number;
    }>;
  };
  projects: {
    total: number;
    completed: number;
    inProgress: number;
    planning: number;
    ideas: number;
  };
  jobs: {
    totalApplications: number;
    saved: number;
    applied: number;
    assessment: number;
    interview: number;
    offer: number;
    rejected: number;
    withdrawn: number;
    responseRate: number | null;
    offerRate: number | null;
  };
  activity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
}

export default function AnalyticsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadAnalytics();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setError('Authentication required. Please sign in to view your career analytics.');
    }
  }, [authLoading, isAuthenticated]);

  async function loadAnalytics() {
    setLoading(true);
    setError('');
    try {
      const res: any = await ApiClient.get('/analytics');
      if (res && res.success && res.analytics) {
        setAnalytics(res.analytics);
      } else {
        setError('Unable to load analytics data.');
      }
    } catch (err: any) {
      // Silent error handler — formatted into state without triggering Next.js Dev Overlay
      setError(err?.message || 'Unable to connect to analytics service.');
    } finally {
      setLoading(false);
    }
  }

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4" />
                <span>Real-Time Performance Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Career Analytics & Insights
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Data synthesized strictly from your authenticated MongoDB profile, skills, projects, and interviews.
              </p>
            </div>

            {isAuthenticated && (
              <button
                onClick={loadAnalytics}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary/80 hover:bg-accent text-xs font-semibold text-foreground border border-border transition-all active:scale-95 disabled:opacity-50 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading || authLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Analytics</span>
              </button>
            )}
          </div>

          {/* Loading & Error States */}
          {(loading || authLoading) && (
            <div className="p-12 rounded-2xl bg-card border border-border text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
              <div className="text-sm font-semibold text-foreground">Compiling your real-time career analytics...</div>
              <div className="text-xs text-muted-foreground">Gathering your skills, project progress, and interview records.</div>
            </div>
          )}

          {error && !loading && !authLoading && (
            <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-4 max-w-md mx-auto">
              <div className="text-sm font-semibold text-red-500">{error}</div>
              {error.includes('Authentication required') || error.includes('sign in') ? (
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to View Analytics</span>
                </Link>
              ) : (
                <button
                  onClick={loadAnalytics}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all"
                >
                  Retry Loading
                </button>
              )}
            </div>
          )}

          {!loading && !authLoading && !error && analytics && (
            <>
              {/* 1. TOP KPI SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Readiness KPI */}
                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-2 hover:border-blue-500/40 transition-colors">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium uppercase tracking-wider">Career Readiness</span>
                    <Award className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">
                    {analytics.readinessScore.current !== null ? `${analytics.readinessScore.current}%` : 'Not Set'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {analytics.readinessScore.current !== null
                      ? 'Weighted across all platform metrics'
                      : 'Complete your profile to generate score'}
                  </div>
                </div>

                {/* Skills KPI */}
                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-2 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium uppercase tracking-wider">Skills Tracked</span>
                    <BrainCircuit className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">{analytics.skills.total}</div>
                  <div className="text-xs text-muted-foreground">
                    {analytics.skills.averageProficiency !== null
                      ? `${analytics.skills.averageProficiency}% avg proficiency (${analytics.skills.mastered} mastered)`
                      : 'No skills recorded yet'}
                  </div>
                </div>

                {/* Projects KPI */}
                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-2 hover:border-purple-500/40 transition-colors">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium uppercase tracking-wider">Projects Built</span>
                    <FolderGit2 className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">{analytics.projects.total}</div>
                  <div className="text-xs text-muted-foreground">
                    {analytics.projects.completed} completed • {analytics.projects.inProgress} in progress
                  </div>
                </div>

                {/* Interviews KPI */}
                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-2 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium uppercase tracking-wider">Mock Interviews</span>
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">{analytics.interviews.totalSessions}</div>
                  <div className="text-xs text-muted-foreground">
                    {analytics.interviews.averageScore !== null
                      ? `${analytics.interviews.averageScore}% avg score (${analytics.interviews.bestScore}% peak)`
                      : 'No interview sessions completed'}
                  </div>
                </div>
              </div>

              {/* 2. CHARTS SECTION 1: READINESS HISTORY & SKILL BREAKDOWN */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Career Readiness History Chart */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground">Career Readiness Progression</h2>
                      <p className="text-xs text-muted-foreground">Historical readiness records stored in MongoDB</p>
                    </div>
                    {analytics.readinessScore.current !== null && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        Current: {analytics.readinessScore.current}%
                      </span>
                    )}
                  </div>

                  {analytics.readinessScore.history.length > 0 ? (
                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.readinessScore.history}>
                          <defs>
                            <linearGradient id="readinessGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                          <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickFormatter={formatDate} />
                          <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--card)',
                              borderColor: 'var(--border)',
                              borderRadius: '12px',
                              fontSize: '12px',
                              color: 'var(--foreground)',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="overallScore"
                            name="Readiness Score"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#readinessGlow)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 w-full flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-xl text-center space-y-3">
                      <Award className="w-8 h-8 text-muted-foreground/50" />
                      <div className="text-xs text-muted-foreground font-medium">No readiness history recorded yet.</div>
                      <Link
                        href="/profile"
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Complete Profile Snapshot</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Skill Competency Breakdown Chart */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground">Skill Domain Breakdown</h2>
                      <p className="text-xs text-muted-foreground">Average proficiency by technical category</p>
                    </div>
                    {analytics.skills.total > 0 && (
                      <span className="text-xs font-semibold text-emerald-500">
                        {analytics.skills.total} Total Skills
                      </span>
                    )}
                  </div>

                  {analytics.skills.categoryBreakdown.length > 0 ? (
                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.skills.categoryBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                          <XAxis dataKey="category" stroke="#71717a" fontSize={11} />
                          <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--card)',
                              borderColor: 'var(--border)',
                              borderRadius: '12px',
                              fontSize: '12px',
                              color: 'var(--foreground)',
                            }}
                          />
                          <Bar dataKey="avgProficiency" name="Avg Proficiency %" fill="#10B981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 w-full flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-xl text-center space-y-3">
                      <BrainCircuit className="w-8 h-8 text-muted-foreground/50" />
                      <div className="text-xs text-muted-foreground font-medium">No skills added yet.</div>
                      <Link
                        href="/skills"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Your First Skill</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. CHARTS SECTION 2: JOB FUNNEL & INTERVIEW PERFORMANCE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Job Search Funnel Chart */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground">Job Search Pipeline</h2>
                      <p className="text-xs text-muted-foreground">Applications categorized by status</p>
                    </div>
                    {analytics.jobs.totalApplications > 0 && (
                      <span className="text-xs font-semibold text-purple-500">
                        {analytics.jobs.totalApplications} Applications
                      </span>
                    )}
                  </div>

                  {analytics.jobs.totalApplications > 0 ? (
                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Saved', count: analytics.jobs.saved },
                            { name: 'Applied', count: analytics.jobs.applied },
                            { name: 'Assessment', count: analytics.jobs.assessment },
                            { name: 'Interview', count: analytics.jobs.interview },
                            { name: 'Offer', count: analytics.jobs.offer },
                            { name: 'Rejected', count: analytics.jobs.rejected },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                          <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                          <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--card)',
                              borderColor: 'var(--border)',
                              borderRadius: '12px',
                              fontSize: '12px',
                              color: 'var(--foreground)',
                            }}
                          />
                          <Bar dataKey="count" name="Applications" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 w-full flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-xl text-center space-y-3">
                      <Briefcase className="w-8 h-8 text-muted-foreground/50" />
                      <div className="text-xs text-muted-foreground font-medium">No job applications tracked yet.</div>
                      <Link
                        href="/jobs"
                        className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add First Job Application</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Interview Performance Chart */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground">Interview Evaluation Scores</h2>
                      <p className="text-xs text-muted-foreground">Average scores achieved per interview category</p>
                    </div>
                    {analytics.interviews.totalSessions > 0 && (
                      <span className="text-xs font-semibold text-amber-500">
                        {analytics.interviews.totalSessions} Sessions
                      </span>
                    )}
                  </div>

                  {analytics.interviews.performance.length > 0 ? (
                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.interviews.performance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                          <XAxis dataKey="category" stroke="#71717a" fontSize={11} />
                          <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--card)',
                              borderColor: 'var(--border)',
                              borderRadius: '12px',
                              fontSize: '12px',
                              color: 'var(--foreground)',
                            }}
                          />
                          <Bar dataKey="score" name="Avg Score %" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 w-full flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-xl text-center space-y-3">
                      <Zap className="w-8 h-8 text-muted-foreground/50" />
                      <div className="text-xs text-muted-foreground font-medium">No interview sessions completed yet.</div>
                      <Link
                        href="/interview"
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Start Mock Interview</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. REAL ACTIVITY TIMELINE */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-foreground">Recent Platform Activity</h2>
                    <p className="text-xs text-muted-foreground">Chronological audit log of your profile updates and milestones</p>
                  </div>
                  <ActivityIcon className="w-4 h-4 text-blue-500" />
                </div>

                {analytics.activity.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {analytics.activity.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-xl bg-secondary/40 border border-border/70 flex items-start justify-between gap-4 hover:border-blue-500/30 transition-colors"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="text-xs font-bold text-foreground truncate">{act.title}</div>
                          {act.description && <div className="text-xs text-muted-foreground line-clamp-1">{act.description}</div>}
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground shrink-0 pt-0.5">
                          {formatDate(act.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-border rounded-xl text-center space-y-2">
                    <ActivityIcon className="w-6 h-6 text-muted-foreground/50 mx-auto" />
                    <div className="text-xs text-muted-foreground">No recent activity logged. Add skills, projects, or job applications to populate your timeline.</div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
