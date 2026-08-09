'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, Activity as ActivityIcon } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from 'recharts';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';

export default function AnalyticsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const res: any = await ApiClient.get('/analytics');
      setAnalytics(res.analytics);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  const trendData = analytics?.readinessTrend || [
    { week: 'Week 1', score: 35 },
    { week: 'Week 2', score: 48 },
    { week: 'Week 3', score: 58 },
    { week: 'Week 4', score: 65 },
    { week: 'Week 5', score: 72 },
    { week: 'Current', score: 78 },
  ];

  const radarData = analytics?.skillGrowthRadar || [
    { category: 'Frontend', score: 85, fullMark: 100 },
    { category: 'Backend', score: 70, fullMark: 100 },
    { category: 'Database', score: 65, fullMark: 100 },
    { category: 'DevOps', score: 45, fullMark: 100 },
    { category: 'DSA', score: 60, fullMark: 100 },
    { category: 'System Design', score: 50, fullMark: 100 },
  ];

  const funnelData = analytics?.jobFunnel || [
    { name: 'Saved', count: 5 },
    { name: 'Applied', count: 12 },
    { name: 'Assessments', count: 4 },
    { name: 'Interviews', count: 3 },
    { name: 'Offers', count: 1 },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <BarChart3 className="w-4 h-4" />
              <span>Performance & Growth Visualizer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Career Analytics</h1>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Career Readiness Score Over Time */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Career Readiness Score Growth</h2>
                  <span className="text-xs text-zinc-400">Progress trajectory over past 6 weeks</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> +43 pts
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#scoreGlow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skill Domain Radar */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-4">
              <div>
                <h2 className="text-base font-bold text-white">Technical Competency Radar</h2>
                <span className="text-xs text-zinc-400">Domain distribution vs target role standards</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="category" stroke="#a1a1aa" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#3f3f46" />
                    <Radar name="Competency" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Job Application Funnel Bar Chart */}
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Job Search Conversion Funnel</h2>
              <span className="text-xs text-zinc-400">Applications count by pipeline status stage</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
