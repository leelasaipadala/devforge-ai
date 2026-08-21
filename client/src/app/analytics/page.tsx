'use client';

import {useState, useEffect, useCallback} from 'react';
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
  AlertCircle,
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
  CartesianGrid,
} from 'recharts';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AuroraCard } from '@/components/AuroraCard';
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraBadge } from '@/components/AuroraBadge';
import { AuroraProgress } from '@/components/AuroraProgress';

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
  const handleMobileMenuClick = useCallback(() => setMobileOpen(true), []);
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
      setError(err?.message || 'Unable to connect to analytics service.');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/90 backdrop-blur-md border border-border/80 p-3 rounded-xl shadow-lg">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-[13px] font-medium">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-bold text-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={handleMobileMenuClick} />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header Section */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-primary uppercase mb-2">
                <BarChart3 className="w-4 h-4" />
                <span>Real-Time Dashboard</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Career Analytics
              </h1>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                Data synthesized strictly from your authenticated MongoDB profile, skills, projects, and interviews.
              </p>
            </div>

            {isAuthenticated && (
              <AuroraButton
                onClick={loadAnalytics}
                disabled={loading}
                variant="secondary"
                className="gap-2 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${loading || authLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Analytics</span>
              </AuroraButton>
            )}
          </header>

          {/* Loading & Error States */}
          {(loading || authLoading) && (
            <AuroraCard className="p-16 text-center space-y-4 border-dashed border-2">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
              <div className="text-lg font-bold text-foreground">Compiling Analytics...</div>
              <div className="text-[14px] text-muted-foreground font-medium">Gathering your skills, project progress, and interview records.</div>
            </AuroraCard>
          )}

          {error && !loading && !authLoading && (
            <AuroraCard className="p-8 text-center space-y-5 max-w-md mx-auto border-danger/20 bg-danger/5">
              <div className="w-12 h-12 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 text-danger" />
              </div>
              <div className="text-[14px] font-bold text-danger">{error}</div>
              {error.includes('Authentication required') || error.includes('sign in') ? (
                <Link href="/auth/sign-in" className="inline-block">
                  <AuroraButton variant="primary" className="gap-2 mx-auto">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to View</span>
                  </AuroraButton>
                </Link>
              ) : (
                <AuroraButton onClick={loadAnalytics} variant="danger" className="mx-auto">
                  Retry Loading
                </AuroraButton>
              )}
            </AuroraCard>
          )}

          {!loading && !authLoading && !error && analytics && (
            <div className="space-y-8">
              {/* 1. TOP KPI SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Readiness KPI */}
                <AuroraCard className="p-6 relative overflow-hidden group hover:border-primary/40 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Readiness</span>
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-4xl font-extrabold text-foreground mb-2 relative z-10">
                    {analytics.readinessScore.current !== null ? `${analytics.readinessScore.current}%` : '--'}
                  </div>
                  <div className="text-[12px] text-muted-foreground font-medium relative z-10">
                    {analytics.readinessScore.current !== null ? 'Platform-wide weighted score' : 'Complete profile to score'}
                  </div>
                </AuroraCard>

                {/* Skills KPI */}
                <AuroraCard className="p-6 relative overflow-hidden group hover:border-ai/40 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-ai/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-ai/10 transition-colors"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Skills</span>
                    <BrainCircuit className="w-5 h-5 text-ai" />
                  </div>
                  <div className="text-4xl font-extrabold text-foreground mb-2 relative z-10">{analytics.skills.total}</div>
                  <div className="text-[12px] text-muted-foreground font-medium relative z-10">
                    {analytics.skills.averageProficiency !== null
                      ? `${analytics.skills.averageProficiency}% avg (${analytics.skills.mastered} mastered)`
                      : 'No skills tracked'}
                  </div>
                </AuroraCard>

                {/* Projects KPI */}
                <AuroraCard className="p-6 relative overflow-hidden group hover:border-success/40 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-success/10 transition-colors"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Projects</span>
                    <FolderGit2 className="w-5 h-5 text-success" />
                  </div>
                  <div className="text-4xl font-extrabold text-foreground mb-2 relative z-10">{analytics.projects.total}</div>
                  <div className="text-[12px] text-muted-foreground font-medium relative z-10">
                    {analytics.projects.completed} complete • {analytics.projects.inProgress} ongoing
                  </div>
                </AuroraCard>

                {/* Interviews KPI */}
                <AuroraCard className="p-6 relative overflow-hidden group hover:border-warning/40 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-warning/10 transition-colors"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Interviews</span>
                    <Zap className="w-5 h-5 text-warning" />
                  </div>
                  <div className="text-4xl font-extrabold text-foreground mb-2 relative z-10">{analytics.interviews.totalSessions}</div>
                  <div className="text-[12px] text-muted-foreground font-medium relative z-10">
                    {analytics.interviews.averageScore !== null
                      ? `${analytics.interviews.averageScore}% avg score (${analytics.interviews.bestScore}% peak)`
                      : 'No sessions completed'}
                  </div>
                </AuroraCard>
              </div>

              {/* 2. CHARTS SECTION 1: READINESS HISTORY & SKILL BREAKDOWN */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Career Readiness History Chart */}
                <AuroraCard className="p-6 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Readiness Progression</h2>
                      <p className="text-[12px] text-muted-foreground font-medium mt-1">Historical score records from MongoDB</p>
                    </div>
                    {analytics.readinessScore.current !== null && (
                      <AuroraBadge variant="primary" className="text-[11px] font-mono px-2.5">
                        {analytics.readinessScore.current}%
                      </AuroraBadge>
                    )}
                  </div>

                  {analytics.readinessScore.history.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.readinessScore.history}>
                          <defs>
                            <linearGradient id="readinessGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
                          <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={formatDate} axisLine={false} tickLine={false} dy={10} />
                          <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[0, 100]} axisLine={false} tickLine={false} dx={-10} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="overallScore"
                            name="Readiness Score"
                            stroke="var(--primary)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#readinessGlow)"
                            activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--background)', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 w-full flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-2xl text-center space-y-4">
                      <Award className="w-8 h-8 text-muted-foreground opacity-50" />
                      <div className="text-[13px] text-muted-foreground font-medium">No readiness history recorded yet.</div>
                      <Link href="/profile">
                        <AuroraButton variant="secondary" className="gap-2 h-9 text-[12px]">
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Complete Profile Snapshot</span>
                        </AuroraButton>
                      </Link>
                    </div>
                  )}
                </AuroraCard>

                {/* Skill Competency Breakdown Chart */}
                <AuroraCard className="p-6 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Skill Domain Breakdown</h2>
                      <p className="text-[12px] text-muted-foreground font-medium mt-1">Average proficiency by technical category</p>
                    </div>
                    {analytics.skills.total > 0 && (
                      <AuroraBadge variant="ai" className="text-[11px] font-mono px-2.5">
                        {analytics.skills.total} Skills
                      </AuroraBadge>
                    )}
                  </div>

                  {analytics.skills.categoryBreakdown.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.skills.categoryBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
                          <XAxis dataKey="category" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                          <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[0, 100]} axisLine={false} tickLine={false} dx={-10} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="avgProficiency" 
                            name="Avg Proficiency" 
                            fill="var(--ai)" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 w-full flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-2xl text-center space-y-4">
                      <BrainCircuit className="w-8 h-8 text-muted-foreground opacity-50" />
                      <div className="text-[13px] text-muted-foreground font-medium">No skills added yet.</div>
                      <Link href="/skills">
                        <AuroraButton variant="secondary" className="gap-2 h-9 text-[12px]">
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Add Your First Skill</span>
                        </AuroraButton>
                      </Link>
                    </div>
                  )}
                </AuroraCard>
              </div>

              {/* 3. CHARTS SECTION 2: JOB FUNNEL & INTERVIEW PERFORMANCE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Job Search Funnel Chart */}
                <AuroraCard className="p-6 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Job Search Pipeline</h2>
                      <p className="text-[12px] text-muted-foreground font-medium mt-1">Applications categorized by status</p>
                    </div>
                    {analytics.jobs.totalApplications > 0 && (
                      <AuroraBadge variant="success" className="text-[11px] font-mono px-2.5">
                        {analytics.jobs.totalApplications} Apps
                      </AuroraBadge>
                    )}
                  </div>

                  {analytics.jobs.totalApplications > 0 ? (
                    <div className="h-64 w-full">
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
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
                          <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                          <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} dx={-10} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="count" 
                            name="Applications" 
                            fill="var(--success)" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 w-full flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-2xl text-center space-y-4">
                      <Briefcase className="w-8 h-8 text-muted-foreground opacity-50" />
                      <div className="text-[13px] text-muted-foreground font-medium">No job applications tracked yet.</div>
                      <Link href="/jobs">
                        <AuroraButton variant="secondary" className="gap-2 h-9 text-[12px]">
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Add First Job Application</span>
                        </AuroraButton>
                      </Link>
                    </div>
                  )}
                </AuroraCard>

                {/* Interview Performance Chart */}
                <AuroraCard className="p-6 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Interview Evaluation Scores</h2>
                      <p className="text-[12px] text-muted-foreground font-medium mt-1">Average scores achieved per interview category</p>
                    </div>
                    {analytics.interviews.totalSessions > 0 && (
                      <AuroraBadge variant="warning" className="text-[11px] font-mono px-2.5">
                        {analytics.interviews.totalSessions} Sessions
                      </AuroraBadge>
                    )}
                  </div>

                  {analytics.interviews.performance.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.interviews.performance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
                          <XAxis dataKey="category" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                          <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[0, 100]} axisLine={false} tickLine={false} dx={-10} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="score" 
                            name="Avg Score" 
                            fill="var(--warning)" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 w-full flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-2xl text-center space-y-4">
                      <Zap className="w-8 h-8 text-muted-foreground opacity-50" />
                      <div className="text-[13px] text-muted-foreground font-medium">No interview sessions completed yet.</div>
                      <Link href="/interview">
                        <AuroraButton variant="secondary" className="gap-2 h-9 text-[12px]">
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Start Mock Interview</span>
                        </AuroraButton>
                      </Link>
                    </div>
                  )}
                </AuroraCard>
              </div>

              {/* 4. REAL ACTIVITY TIMELINE */}
              <AuroraCard className="p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ActivityIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Recent Platform Activity</h2>
                    <p className="text-[12px] text-muted-foreground font-medium">Chronological audit log of your profile updates and milestones</p>
                  </div>
                </div>

                {analytics.activity.length > 0 ? (
                  <div className="space-y-4 relative">
                    <div className="absolute top-4 bottom-4 left-[21px] w-[2px] bg-border/60 z-0"></div>
                    {analytics.activity.map((act, index) => (
                      <div
                        key={act.id || index}
                        className="relative z-10 flex items-start gap-5 group"
                      >
                        <div className="w-11 h-11 rounded-full bg-background border-2 border-border/80 flex items-center justify-center shrink-0 group-hover:border-primary group-hover:text-primary transition-colors shadow-sm">
                          <ActivityIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 p-4 rounded-2xl bg-secondary/30 border border-border/50 group-hover:border-primary/30 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                            <div className="text-[13px] font-bold text-foreground">{act.title}</div>
                            <span className="text-[11px] font-mono font-medium text-muted-foreground px-2 py-0.5 rounded-md bg-background border border-border/50">
                              {formatDate(act.timestamp)}
                            </span>
                          </div>
                          {act.description && <div className="text-[13px] text-muted-foreground font-medium leading-relaxed">{act.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-2xl text-center space-y-3">
                    <ActivityIcon className="w-8 h-8 text-muted-foreground opacity-50 mx-auto" />
                    <div className="text-[13px] text-muted-foreground font-medium">No recent activity logged.</div>
                    <div className="text-[12px] text-muted-foreground">Add skills, projects, or job applications to populate your timeline.</div>
                  </div>
                )}
              </AuroraCard>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
