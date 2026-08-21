'use client';

import {useState, useEffect, useMemo, useCallback} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Calendar,
  DollarSign,
  ExternalLink,
  Trash2,
  X,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  ChevronRight,
  Edit,
  Mail,
  UserCheck,
  Tag,
  Kanban,
  ListFilter,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { AuroraCard } from '@/components/AuroraCard';
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraBadge } from '@/components/AuroraBadge';

const COLUMNS = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];

export default function JobsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [editingJob, setEditingJob] = useState<any>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jobTypeFilter, setJobTypeFilter] = useState('All');
  const [workModeFilter, setWorkModeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Recently Added');

  // Form State
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: 'Remote',
    workMode: 'Remote',
    jobType: 'Full Time',
    jobUrl: '',
    salaryRange: '$120,000 - $150,000',
    status: 'Applied',
    priority: 'Medium',
    applicationDate: new Date().toISOString().split('T')[0],
    deadline: '',
    recruiterName: '',
    recruiterEmail: '',
    nextAction: 'Technical Screening',
    nextActionDate: '',
    notes: '',
    description: '',
  });

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadJobs();
    }
  }, [authLoading, isAuthenticated]);

  async function loadJobs() {
    setLoading(true);
    try {
      const res: any = await ApiClient.get('/jobs');
      setJobs(res.jobs || []);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.position) return;

    try {
      if (editingJob) {
        await ApiClient.put(`/jobs/${editingJob._id}`, formData);
      } else {
        await ApiClient.post('/jobs', formData);
      }
      setModalOpen(false);
      setEditingJob(null);
      resetForm();
      await loadJobs();
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      location: 'Remote',
      workMode: 'Remote',
      jobType: 'Full Time',
      jobUrl: '',
      salaryRange: '',
      status: 'Applied',
      priority: 'Medium',
      applicationDate: new Date().toISOString().split('T')[0],
      deadline: '',
      recruiterName: '',
      recruiterEmail: '',
      nextAction: '',
      nextActionDate: '',
      notes: '',
      description: '',
    });
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await ApiClient.put(`/jobs/${jobId}`, { status: newStatus });
      await loadJobs();
      if (selectedJob && selectedJob._id === jobId) {
        setSelectedJob({ ...selectedJob, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    try {
      await ApiClient.delete(`/jobs/${jobId}`);
      setSelectedJob(null);
      await loadJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const openEditModal = (job: any) => {
    setEditingJob(job);
    setFormData({
      company: job.company || '',
      position: job.position || '',
      location: job.location || 'Remote',
      workMode: job.workMode || 'Remote',
      jobType: job.jobType || 'Full Time',
      jobUrl: job.jobUrl || '',
      salaryRange: job.salaryRange || '',
      status: job.status || 'Applied',
      priority: job.priority || 'Medium',
      applicationDate: job.appliedDate ? new Date(job.appliedDate).toISOString().split('T')[0] : '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
      recruiterName: job.recruiterName || '',
      recruiterEmail: job.recruiterEmail || '',
      nextAction: job.nextAction || '',
      nextActionDate: job.nextActionDate ? new Date(job.nextActionDate).toISOString().split('T')[0] : '',
      notes: job.notes || '',
      description: job.description || '',
    });
    setModalOpen(true);
  };

  // Filtered & Sorted Jobs (memoized for zero input lag)
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
      const matchesType = jobTypeFilter === 'All' || job.jobType === jobTypeFilter;
      const matchesMode = workModeFilter === 'All' || job.workMode === workModeFilter;

      return matchesSearch && matchesStatus && matchesType && matchesMode;
    });
  }, [jobs, searchQuery, statusFilter, jobTypeFilter, workModeFilter]);

  // Calculate Real Statistics
  const totalApps = jobs.length;
  const activeApps = jobs.filter((j) => ['Saved', 'Applied', 'Assessment', 'Interview'].includes(j.status)).length;
  const interviewCount = jobs.filter((j) => j.status === 'Interview').length;
  const offerCount = jobs.filter((j) => j.status === 'Offer').length;
  const appliedTotal = jobs.filter((j) => j.status !== 'Saved').length;
  const responseRate = appliedTotal > 0
    ? Math.round(((interviewCount + offerCount + jobs.filter((j) => j.status === 'Assessment').length) / appliedTotal) * 100)
    : 0;
  const handleMobileMenuClick = useCallback(() => setMobileOpen(true), []);


  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={handleMobileMenuClick} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Main Header Bar */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-2">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-primary uppercase mb-2">
                <Briefcase className="w-4 h-4" />
                <span>Career Opportunities</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Job Search Tracker</h1>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                Track applications, interviews, offers and your career pipeline in one place.
              </p>
            </div>

            <AuroraButton
              onClick={() => {
                setEditingJob(null);
                resetForm();
                setModalOpen(true);
              }}
              variant="primary"
              className="gap-2 shrink-0 h-11"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </AuroraButton>
          </header>

          {/* Real Statistics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <AuroraCard className="p-5 text-center flex flex-col justify-center border-border">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Applications</div>
              <div className="text-3xl font-extrabold text-foreground">{totalApps}</div>
            </AuroraCard>

            <AuroraCard className="p-5 text-center flex flex-col justify-center border-primary/20 bg-primary/5">
              <div className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">Active</div>
              <div className="text-3xl font-extrabold text-primary">{activeApps}</div>
            </AuroraCard>

            <AuroraCard className="p-5 text-center flex flex-col justify-center border-ai/20 bg-ai/5">
              <div className="text-[11px] font-bold text-ai uppercase tracking-widest mb-1">Interviews</div>
              <div className="text-3xl font-extrabold text-ai">{interviewCount}</div>
            </AuroraCard>

            <AuroraCard className="p-5 text-center flex flex-col justify-center border-success/20 bg-success/5">
              <div className="text-[11px] font-bold text-success uppercase tracking-widest mb-1">Offers</div>
              <div className="text-3xl font-extrabold text-success">{offerCount}</div>
            </AuroraCard>

            <AuroraCard className="p-5 text-center flex flex-col justify-center border-warning/20 bg-warning/5 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-bold text-warning uppercase tracking-widest mb-1">Response Rate</div>
              <div className="text-3xl font-extrabold text-warning">{responseRate}%</div>
            </AuroraCard>
          </div>

          {/* Search & Filter Toolbar */}
          <AuroraCard className="p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search companies, roles, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border/80 text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Filter className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-3 rounded-xl bg-background border border-border/80 text-[12px] font-bold text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 appearance-none shadow-sm cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  {COLUMNS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                <select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  className="pl-9 pr-8 py-3 rounded-xl bg-background border border-border/80 text-[12px] font-bold text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 appearance-none shadow-sm cursor-pointer"
                >
                  <option value="All">All Job Types</option>
                  {['Full Time', 'Part Time', 'Internship', 'Contract', 'Freelance'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                <select
                  value={workModeFilter}
                  onChange={(e) => setWorkModeFilter(e.target.value)}
                  className="pl-9 pr-8 py-3 rounded-xl bg-background border border-border/80 text-[12px] font-bold text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 appearance-none shadow-sm cursor-pointer"
                >
                  <option value="All">All Modes</option>
                  {['Remote', 'Hybrid', 'On-site'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </AuroraCard>

          {/* Kanban Board */}
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar min-h-[600px]">
            {COLUMNS.map((col) => {
              const colJobs = filteredJobs.filter((j) => j.status === col);
              return (
                <div key={col} className="w-[320px] min-w-[320px] shrink-0 bg-card/50 border border-border/60 rounded-2xl p-4 flex flex-col snap-start backdrop-blur-sm">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-4 px-1">
                    <span className="text-[13px] font-bold text-foreground uppercase tracking-widest">{col}</span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] bg-secondary/80 text-muted-foreground font-bold shadow-sm border border-border/40">
                      {colJobs.length}
                    </span>
                  </div>

                  {/* Cards or Column Empty State */}
                  <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {colJobs.length > 0 ? (
                      colJobs.map((job) => (
                        <AuroraCard
                          key={job._id}
                          onClick={() => setSelectedJob(job)}
                          className="p-5 cursor-pointer group hover:border-primary/40 space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {/* Company Logo Avatar */}
                              <div className="w-10 h-10 rounded-xl bg-background border border-border/80 text-foreground flex items-center justify-center font-extrabold text-[15px] shadow-sm group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                              </div>
                              <div className="space-y-0.5">
                                <h3 className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                                  {job.company}
                                </h3>
                                <div className="text-[12px] text-muted-foreground font-medium leading-tight line-clamp-1">{job.position}</div>
                              </div>
                            </div>

                            {/* Priority Badge */}
                            {job.priority && job.priority === 'High' && (
                              <AuroraBadge variant="danger" className="text-[9px] px-1.5 py-0.5 shrink-0">
                                High
                              </AuroraBadge>
                            )}
                          </div>

                          <div className="text-[11px] font-medium text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {job.workMode || 'Remote'}</span>
                            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.jobType || 'Full Time'}</span>
                            {job.location && <span className="flex items-center gap-1 opacity-70">📍 {job.location}</span>}
                          </div>

                          {job.salaryRange && (
                            <div className="text-[11px] font-bold text-success flex items-center gap-1 bg-success/10 w-fit px-2 py-0.5 rounded-md border border-success/20">
                              <DollarSign className="w-3 h-3" />
                              <span>{job.salaryRange}</span>
                            </div>
                          )}

                          {/* Quick Change Status Dropdown */}
                          <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
                            <select
                              value={job.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(job._id, e.target.value);
                              }}
                              className="bg-background border border-border/80 text-foreground rounded-lg px-2 py-1 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer"
                            >
                              {COLUMNS.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>

                            <span className="text-[11px] font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              View <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </AuroraCard>
                      ))
                    ) : (
                      /* Column Empty State */
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-border/60 rounded-2xl space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center text-muted-foreground mb-1">
                          <Kanban className="w-5 h-5 opacity-50" />
                        </div>
                        <div className="text-muted-foreground text-[13px] font-medium max-w-[200px]">No {col.toLowerCase()} applications</div>
                        <AuroraButton
                          onClick={() => {
                            setEditingJob(null);
                            resetForm();
                            setFormData((prev) => ({ ...prev, status: col }));
                            setModalOpen(true);
                          }}
                          variant="secondary"
                          className="h-8 px-3 text-[11px] gap-1.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add {col}</span>
                        </AuroraButton>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact Analytics Banner */}
          <AuroraCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-ai/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 relative z-10">
              <h3 className="text-[13px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-ai" />
                <span>Career Pipeline Analytics</span>
              </h3>
            </div>
            
            {totalApps > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-foreground relative z-10">
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Interview Conversion</div>
                  <div className="text-2xl font-extrabold text-ai">
                    {Math.round((interviewCount / (totalApps || 1)) * 100)}%
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Offer Conversion</div>
                  <div className="text-2xl font-extrabold text-success">
                    {Math.round((offerCount / (totalApps || 1)) * 100)}%
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">DevForge Alignment</div>
                  <div className="text-[14px] font-bold text-primary mt-3 flex items-center gap-2">
                    <Award className="w-4 h-4" /> 85% Match
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground font-medium relative z-10">
                Not enough data yet. Add a few job applications to view real-time career pipeline analytics.
              </p>
            )}
          </AuroraCard>
        </main>
      </div>

      {/* ADD / EDIT JOB APPLICATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-card border border-border rounded-[var(--radius-xl)] p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h3 className="text-xl font-bold text-foreground">
                {editingJob ? 'Edit Application' : 'Add Application'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Company Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Linear, Stripe"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Position *</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer Intern"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Status Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[13px] font-bold text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm cursor-pointer"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Work Mode</label>
                  <select
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[13px] font-bold text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm cursor-pointer"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[13px] font-bold text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm cursor-pointer"
                  >
                    {['Full Time', 'Part Time', 'Internship', 'Contract', 'Freelance'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, IN / Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $120,000 - $140,000"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Job Post URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.jobUrl}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Recruiter Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Connor"
                    value={formData.recruiterName}
                    onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Recruiter Email</label>
                  <input
                    type="email"
                    placeholder="e.g. recruiter@company.com"
                    value={formData.recruiterEmail}
                    onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Notes & Context</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Submitted referral via engineering team."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm resize-none"
                />
              </div>

              <AuroraButton
                type="submit"
                variant="primary"
                className="w-full justify-center py-4 mt-2"
              >
                {editingJob ? 'Update Application' : 'Save Application'}
              </AuroraButton>
            </form>
          </div>
        </div>
      )}

      {/* JOB DETAILS SIDE MODAL / DRAWER */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md bg-card border border-border rounded-[var(--radius-xl)] shadow-2xl flex flex-col overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8 relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-background border border-border/80 text-foreground flex items-center justify-center font-extrabold text-xl shadow-sm">
                    {selectedJob.company ? selectedJob.company.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">{selectedJob.company}</h2>
                    <div className="text-[14px] text-primary font-bold mt-0.5">{selectedJob.position}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Status Timeline */}
              <div className="p-5 rounded-2xl bg-secondary/40 border border-border/50 space-y-4">
                <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Stage Timeline</div>
                <div className="space-y-4">
                  {['Saved', 'Applied', 'Assessment', 'Interview', 'Offer'].map((stg, idx) => {
                    const isCurrent = selectedJob.status === stg;
                    const isPast = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer'].indexOf(selectedJob.status) >= idx;
                    
                    return (
                      <div key={stg} className="flex items-center gap-4 text-[13px] font-bold">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                          isCurrent ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' : 
                          isPast ? 'bg-primary/20 border-primary text-primary' :
                          'bg-background border-border text-transparent'
                        }`}>
                          {(isPast && !isCurrent) && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {isCurrent && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className={isCurrent ? 'text-foreground' : isPast ? 'text-foreground opacity-80' : 'text-muted-foreground'}>{stg}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detail Items */}
              <div className="space-y-3 text-[13px]">
                <div className="flex justify-between p-3 rounded-xl bg-background border border-border/80 shadow-sm">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-[11px] self-center">Location</span>
                  <span className="font-bold text-foreground">{selectedJob.location || 'Remote'}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-background border border-border/80 shadow-sm">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-[11px] self-center">Work Mode</span>
                  <span className="font-bold text-foreground">{selectedJob.workMode || 'Remote'}</span>
                </div>
                {selectedJob.salaryRange && (
                  <div className="flex justify-between p-3 rounded-xl bg-success/5 border border-success/20 shadow-sm">
                    <span className="text-success font-bold uppercase tracking-wider text-[11px] self-center">Salary</span>
                    <span className="font-extrabold text-success">{selectedJob.salaryRange}</span>
                  </div>
                )}
                {selectedJob.recruiterName && (
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-background border border-border/80 shadow-sm">
                    <span className="text-muted-foreground font-bold uppercase tracking-wider text-[11px]">Recruiter</span>
                    <span className="font-bold text-foreground">{selectedJob.recruiterName}</span>
                    <span className="font-medium text-muted-foreground text-[12px]">{selectedJob.recruiterEmail}</span>
                  </div>
                )}
              </div>

              {selectedJob.notes && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-foreground">Notes</label>
                  <p className="text-[13px] text-muted-foreground font-medium p-4 rounded-xl bg-secondary/50 border border-border/50 leading-relaxed">{selectedJob.notes}</p>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-6 border-t border-border/50 flex items-center justify-between gap-4 bg-card/80 backdrop-blur-md relative z-20">
              <AuroraButton
                onClick={() => handleDeleteJob(selectedJob._id)}
                variant="danger"
                className="gap-2 px-4"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </AuroraButton>

              <AuroraButton
                onClick={() => openEditModal(selectedJob)}
                variant="primary"
                className="gap-2 flex-1 justify-center"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Details</span>
              </AuroraButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
