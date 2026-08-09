'use client';

import { useState, useEffect } from 'react';
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
import { ApiClient } from '@/lib/api';

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

  useEffect(() => {
    loadJobs();
  }, []);

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

  // Filtered & Sorted Jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    const matchesType = jobTypeFilter === 'All' || job.jobType === jobTypeFilter;
    const matchesMode = workModeFilter === 'All' || job.workMode === workModeFilter;

    return matchesSearch && matchesStatus && matchesType && matchesMode;
  });

  // Calculate Real Statistics
  const totalApps = jobs.length;
  const activeApps = jobs.filter((j) => ['Saved', 'Applied', 'Assessment', 'Interview'].includes(j.status)).length;
  const interviewCount = jobs.filter((j) => j.status === 'Interview').length;
  const offerCount = jobs.filter((j) => j.status === 'Offer').length;
  const appliedTotal = jobs.filter((j) => j.status !== 'Saved').length;
  const responseRate = appliedTotal > 0
    ? Math.round(((interviewCount + offerCount + jobs.filter((j) => j.status === 'Assessment').length) / appliedTotal) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Main Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-500">
                <Briefcase className="w-4 h-4" />
                <span>Career Opportunities</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Job Search Tracker</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Track applications, interviews, offers and your career pipeline in one place.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingJob(null);
                resetForm();
                setModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </button>
          </div>

          {/* Real Statistics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground">Total Applications</div>
              <div className="text-2xl font-extrabold text-foreground">{totalApps}</div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground">Active Applications</div>
              <div className="text-2xl font-extrabold text-blue-500">{activeApps}</div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground">Interviews</div>
              <div className="text-2xl font-extrabold text-purple-500">{interviewCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground">Offers</div>
              <div className="text-2xl font-extrabold text-emerald-500">{offerCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-1 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-medium text-muted-foreground">Response Rate</div>
              <div className="text-2xl font-extrabold text-amber-500">{responseRate}%</div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search companies, roles, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none"
              >
                <option value="All">All Statuses</option>
                {COLUMNS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none"
              >
                <option value="All">All Job Types</option>
                {['Full Time', 'Part Time', 'Internship', 'Contract', 'Freelance'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={workModeFilter}
                onChange={(e) => setWorkModeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none"
              >
                <option value="All">All Work Modes</option>
                {['Remote', 'Hybrid', 'On-site'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => {
              const colJobs = filteredJobs.filter((j) => j.status === col);
              return (
                <div key={col} className="bg-card border border-border rounded-2xl p-3 flex flex-col min-h-[480px]">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-3 px-1">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">{col}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary text-muted-foreground font-bold">
                      {colJobs.length}
                    </span>
                  </div>

                  {/* Cards or Column Empty State */}
                  <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                    {colJobs.length > 0 ? (
                      colJobs.map((job) => (
                        <div
                          key={job._id}
                          onClick={() => setSelectedJob(job)}
                          className="p-4 rounded-xl bg-secondary/60 border border-border hover:border-blue-500/50 transition-all space-y-2.5 cursor-pointer group shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              {/* Company Logo Avatar */}
                              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold text-xs border border-blue-500/30 shrink-0">
                                {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-foreground group-hover:text-blue-500 transition-colors leading-tight">
                                  {job.company}
                                </h3>
                                <div className="text-[11px] text-muted-foreground font-medium leading-tight">{job.position}</div>
                              </div>
                            </div>

                            {/* Priority Badge */}
                            {job.priority && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                job.priority === 'High' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-secondary text-muted-foreground'
                              }`}>
                                {job.priority}
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-muted-foreground flex flex-wrap gap-2">
                            <span>📍 {job.location || 'Remote'}</span>
                            <span>• {job.workMode || 'Remote'}</span>
                            {job.jobType && <span>• {job.jobType}</span>}
                          </div>

                          {job.salaryRange && (
                            <div className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{job.salaryRange}</span>
                            </div>
                          )}

                          {/* Quick Change Status Dropdown */}
                          <div className="pt-2 border-t border-border flex items-center justify-between text-[10px]">
                            <select
                              value={job.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(job._id, e.target.value);
                              }}
                              className="bg-secondary border border-border text-foreground rounded px-1.5 py-0.5 focus:outline-none"
                            >
                              {COLUMNS.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJob(job);
                              }}
                              className="text-blue-500 hover:underline font-semibold flex items-center gap-0.5"
                            >
                              <span>Details</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Column Empty State */
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center border border-dashed border-border rounded-xl space-y-2">
                        <div className="text-muted-foreground text-xs">No {col.toLowerCase()} applications</div>
                        <button
                          onClick={() => {
                            setEditingJob(null);
                            resetForm();
                            setFormData((prev) => ({ ...prev, status: col }));
                            setModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent text-[11px] font-semibold text-foreground border border-border flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add {col}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact Analytics Banner */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Career Pipeline Analytics</span>
            </h3>
            {totalApps > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-foreground">
                <div className="p-3 rounded-xl bg-secondary/60 border border-border">
                  <div className="text-[11px] text-muted-foreground mb-1">Interview Conversion</div>
                  <div className="text-lg font-bold text-purple-500">
                    {Math.round((interviewCount / (totalApps || 1)) * 100)}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-secondary/60 border border-border">
                  <div className="text-[11px] text-muted-foreground mb-1">Offer Conversion</div>
                  <div className="text-lg font-bold text-emerald-500">
                    {Math.round((offerCount / (totalApps || 1)) * 100)}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-secondary/60 border border-border">
                  <div className="text-[11px] text-muted-foreground mb-1">DevForge Score Alignment</div>
                  <div className="text-lg font-bold text-blue-500">Weighted (20% Portfolio + 15% Skills)</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Not enough data yet. Add a few job applications to view real-time career pipeline analytics.
              </p>
            )}
          </div>
        </main>
      </div>

      {/* ADD / EDIT JOB APPLICATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingJob ? 'Edit Job Application' : 'Add New Job Application'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Company Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Linear, Stripe"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Job Title / Position *</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer Intern"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Status Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Work Mode</label>
                  <select
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                  >
                    {['Full Time', 'Part Time', 'Internship', 'Contract', 'Freelance'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, IN / Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $120,000 - $140,000"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Job Post URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.jobUrl}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Recruiter Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Connor"
                    value={formData.recruiterName}
                    onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Recruiter Email</label>
                  <input
                    type="email"
                    placeholder="e.g. recruiter@company.com"
                    value={formData.recruiterEmail}
                    onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Notes & Application Context</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Submitted referral via engineering team."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-lg shadow-blue-600/20"
              >
                {editingJob ? 'Update Application' : 'Save Application to Pipeline'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* JOB DETAILS SIDE MODAL / DRAWER */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-y-auto space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold text-sm border border-blue-500/30">
                    {selectedJob.company ? selectedJob.company.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">{selectedJob.company}</h2>
                    <div className="text-xs text-blue-500 font-medium">{selectedJob.position}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Timeline */}
              <div className="p-4 rounded-xl bg-secondary/80 border border-border space-y-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Stage Timeline</div>
                <div className="space-y-2">
                  {['Saved', 'Applied', 'Assessment', 'Interview', 'Offer'].map((stg, idx) => {
                    const isCurrent = selectedJob.status === stg;
                    return (
                      <div key={stg} className="flex items-center gap-2 text-xs">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                          isCurrent ? 'bg-blue-500 text-white' : 'bg-secondary text-muted-foreground'
                        }`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                        <span className={isCurrent ? 'font-bold text-foreground' : 'text-muted-foreground'}>{stg}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detail Items */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-secondary/60 border border-border">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-semibold text-foreground">{selectedJob.location || 'Remote'}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-secondary/60 border border-border">
                  <span className="text-muted-foreground">Work Mode:</span>
                  <span className="font-semibold text-foreground">{selectedJob.workMode || 'Remote'}</span>
                </div>
                {selectedJob.salaryRange && (
                  <div className="flex justify-between p-2.5 rounded-lg bg-secondary/60 border border-border">
                    <span className="text-muted-foreground">Salary:</span>
                    <span className="font-semibold text-emerald-500">{selectedJob.salaryRange}</span>
                  </div>
                )}
                {selectedJob.recruiterName && (
                  <div className="flex justify-between p-2.5 rounded-lg bg-secondary/60 border border-border">
                    <span className="text-muted-foreground">Recruiter:</span>
                    <span className="font-semibold text-foreground">{selectedJob.recruiterName} ({selectedJob.recruiterEmail})</span>
                  </div>
                )}
              </div>

              {selectedJob.notes && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Notes</label>
                  <p className="text-xs text-muted-foreground p-3 rounded-xl bg-secondary border border-border">{selectedJob.notes}</p>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
              <button
                onClick={() => handleDeleteJob(selectedJob._id)}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => openEditModal(selectedJob)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Application</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

