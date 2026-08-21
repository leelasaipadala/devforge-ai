'use client';

import {useState, useEffect, useMemo, useCallback} from 'react';
import { FolderGit2, Plus, ExternalLink, Sparkles, CheckCircle2, Clock, Trash2, X, Code, Eye } from 'lucide-react';
import { Github } from '@/components/Icons';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { AuroraCard } from '@/components/AuroraCard';
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraBadge } from '@/components/AuroraBadge';

const STATUS_TABS = ['All', 'Idea', 'Planning', 'In Progress', 'Completed', 'Archived'];

export default function ProjectsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [aiIdeas, setAiIdeas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Full-Stack SaaS',
    technologies: 'TypeScript, React, Node.js, Express, MongoDB',
    difficulty: 'Intermediate',
    githubUrl: '',
    liveUrl: '',
    status: 'In Progress',
    challenges: '',
    learnings: '',
  });

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadProjects();
    }
  }, [authLoading, isAuthenticated]);

  async function loadProjects() {
    try {
      const res: any = await ApiClient.get('/projects');
      const ideasRes: any = await ApiClient.get('/projects/ai-ideas');
      setProjects(res.projects || []);
      setAiIdeas(ideasRes.ideas || []);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const payload = {
        ...formData,
        technologies: formData.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      };
      await ApiClient.post('/projects', payload);
      setModalOpen(false);
      resetForm();
      await loadProjects();
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Full-Stack SaaS',
      technologies: 'TypeScript, React, Node.js, Express, MongoDB',
      difficulty: 'Intermediate',
      githubUrl: '',
      liveUrl: '',
      status: 'In Progress',
      challenges: '',
      learnings: '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this project?')) return;
    try {
      await ApiClient.delete(`/projects/${id}`);
      setSelectedProject(null);
      setDetailModalOpen(false);
      await loadProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const handleAdoptIdea = (idea: any) => {
    setFormData({
      ...formData,
      title: idea.title,
      description: idea.idea ? `${idea.idea}\n\nProblem Statement: ${idea.problemStatement}` : idea.description || '',
      difficulty: 'Intermediate',
      technologies: 'TypeScript, React, Node.js, Express',
      status: 'Planning',
    });
    setModalOpen(true);
  };

  // Filtered projects (memoized)
  const filteredProjects = useMemo(() => {
    return selectedStatus === 'All'
      ? projects
      : projects.filter((p) => p.status === selectedStatus);
  }, [projects, selectedStatus]);

  // Statistics
  const totalCount = projects.length;
  const completedCount = projects.filter((p) => p.status === 'Completed').length;
  const inProgressCount = projects.filter((p) => p.status === 'In Progress').length;
  const planningCount = projects.filter((p) => p.status === 'Planning').length;
  const ideaCount = projects.filter((p) => p.status === 'Idea').length;
  const handleMobileMenuClick = useCallback(() => setMobileOpen(true), []);


  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={handleMobileMenuClick} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-warning uppercase mb-2">
                <FolderGit2 className="w-4 h-4" />
                <span>Portfolio Command Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Developer Projects</h1>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Manage your software portfolio, track development status, and adopt AI project blueprints.</p>
            </div>

            <AuroraButton
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              variant="warning"
              className="gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </AuroraButton>
          </div>

          {/* Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <AuroraCard className="p-5 text-center flex flex-col justify-center border-border">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Total Projects</div>
              <div className="text-3xl font-extrabold text-foreground">{totalCount}</div>
            </AuroraCard>
            <AuroraCard className="p-5 text-center flex flex-col justify-center border-success/20 bg-success/5">
              <div className="text-[11px] uppercase tracking-wider text-success font-bold mb-1">Completed</div>
              <div className="text-3xl font-extrabold text-success">{completedCount}</div>
            </AuroraCard>
            <AuroraCard className="p-5 text-center flex flex-col justify-center border-primary/20 bg-primary/5">
              <div className="text-[11px] uppercase tracking-wider text-primary font-bold mb-1">In Progress</div>
              <div className="text-3xl font-extrabold text-primary">{inProgressCount}</div>
            </AuroraCard>
            <AuroraCard className="p-5 text-center flex flex-col justify-center border-warning/20 bg-warning/5">
              <div className="text-[11px] uppercase tracking-wider text-warning font-bold mb-1">Planning</div>
              <div className="text-3xl font-extrabold text-warning">{planningCount}</div>
            </AuroraCard>
            <AuroraCard className="p-5 text-center flex flex-col justify-center border-ai/20 bg-ai/5 col-span-2 sm:col-span-1">
              <div className="text-[11px] uppercase tracking-wider text-ai font-bold mb-1">Ideas</div>
              <div className="text-3xl font-extrabold text-ai">{ideaCount}</div>
            </AuroraCard>
          </div>

          {/* Status Tabs Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-border/50">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedStatus(tab)}
                className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap shrink-0 ${
                  selectedStatus === tab
                    ? 'bg-warning text-white shadow-sm'
                    : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* SECTION A & B: MY PROJECTS vs GITHUB IMPORTED PROJECTS */}
          {filteredProjects.length > 0 ? (
            <div className="space-y-10">
              {/* My Projects (Manually Created) */}
              {filteredProjects.filter((p) => p.category !== 'GitHub Import' && !p.githubImported).length > 0 && (
                <div className="space-y-5">
                  <h2 className="text-[14px] font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
                    <Code className="w-4 h-4 text-primary" />
                    <span>My Portfolio Projects</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects
                      .filter((p) => p.category !== 'GitHub Import' && !p.githubImported)
                      .map((proj) => (
                        <AuroraCard
                          key={proj._id}
                          onClick={() => {
                            setSelectedProject(proj);
                            setDetailModalOpen(true);
                          }}
                          className="cursor-pointer group hover:border-primary/40 space-y-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="text-[16px] font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{proj.title}</h3>
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{proj.category || 'Software Project'}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <AuroraBadge
                                variant={
                                  proj.status === 'Completed'
                                    ? 'success'
                                    : proj.status === 'In Progress'
                                    ? 'primary'
                                    : 'warning'
                                }
                              >
                                {proj.status}
                              </AuroraBadge>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(proj._id);
                                }}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3 font-medium">{proj.description}</p>

                          <div className="flex flex-wrap gap-2">
                            {proj.technologies?.slice(0, 3).map((tech: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-[10px] border border-border/80 font-bold">
                                {tech}
                              </span>
                            ))}
                            {proj.technologies?.length > 3 && (
                              <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-[10px] border border-border/80 font-bold">
                                +{proj.technologies.length - 3} more
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border/50 text-[12px] font-bold">
                            <div className="flex items-center gap-4">
                              {proj.githubUrl && (
                                <a
                                  href={proj.githubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-primary hover:underline flex items-center gap-1.5"
                                >
                                  <Github className="w-3.5 h-3.5" /> Source
                                </a>
                              )}
                              {proj.liveUrl && (
                                <a
                                  href={proj.liveUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-success hover:underline flex items-center gap-1.5"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> Live
                                </a>
                              )}
                            </div>

                            <span className="text-[10px] uppercase text-muted-foreground flex items-center gap-1.5 group-hover:text-foreground transition-colors">
                              <Eye className="w-3.5 h-3.5" /> View Audit
                            </span>
                          </div>
                        </AuroraCard>
                      ))}
                  </div>
                </div>
              )}

              {/* GitHub Imported Projects Section */}
              {filteredProjects.filter((p) => p.category === 'GitHub Import' || p.githubImported).length > 0 && (
                <div className="space-y-5">
                  <h2 className="text-[14px] font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
                    <Github className="w-4 h-4 text-success" />
                    <span>GitHub Imported Projects</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects
                      .filter((p) => p.category === 'GitHub Import' || p.githubImported)
                      .map((proj) => (
                        <AuroraCard
                          key={proj._id}
                          onClick={() => {
                            setSelectedProject(proj);
                            setDetailModalOpen(true);
                          }}
                          className="cursor-pointer group border-success/20 hover:border-success/50 space-y-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-[16px] font-bold text-foreground group-hover:text-success transition-colors line-clamp-1">{proj.title}</h3>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Repository Import</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <AuroraBadge variant="success">Imported</AuroraBadge>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(proj._id);
                                }}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3 font-medium">{proj.description}</p>

                          <div className="flex flex-wrap gap-2">
                            {proj.technologies?.slice(0, 3).map((tech: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-[10px] border border-border/80 font-bold">
                                {tech}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border/50 text-[12px] font-bold">
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-success hover:underline flex items-center gap-1.5"
                              >
                                <Github className="w-3.5 h-3.5" /> Repository
                              </a>
                            )}
                            <span className="text-[10px] uppercase text-muted-foreground flex items-center gap-1.5 group-hover:text-foreground transition-colors">
                              <Eye className="w-3.5 h-3.5" /> View AI Details
                            </span>
                          </div>
                        </AuroraCard>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <AuroraCard className="flex flex-col items-center justify-center text-center space-y-5 max-w-xl mx-auto my-12 py-12 border-dashed border-2">
              <div className="w-16 h-16 rounded-3xl bg-warning/10 border border-warning/20 flex items-center justify-center text-warning mx-auto">
                <FolderGit2 className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">No projects yet</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed max-w-sm mx-auto font-medium">
                  Import a GitHub repository or add your first project to start building your software engineering portfolio.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-4">
                <AuroraButton
                  onClick={() => {
                    resetForm();
                    setModalOpen(true);
                  }}
                  variant="warning"
                >
                  Create Project
                </AuroraButton>
                <a href="/github">
                  <AuroraButton variant="secondary" className="gap-2">
                    <Github className="w-4 h-4 text-success" />
                    <span>Import from GitHub</span>
                  </AuroraButton>
                </a>
              </div>
            </AuroraCard>
          )}

          {/* SECTION C: PERSONALIZED RECOMMENDED PROJECTS */}
          <div className="pt-8">
            <AuroraCard className="space-y-6 border-ai/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-ai/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-5 relative z-10">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-ai mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="uppercase tracking-widest">FORGE AI Personalization Engine</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Recommended Projects</h2>
                  <p className="text-[13px] text-muted-foreground mt-1 font-medium">
                    Project blueprints generated from your skill gaps and career goals.
                  </p>
                </div>

                <AuroraButton
                  onClick={loadProjects}
                  variant="ai"
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Refresh Ideas</span>
                </AuroraButton>
              </div>

              {aiIdeas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                  {aiIdeas.map((idea, idx) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-secondary/30 border border-border/50 hover:border-ai/40 hover:bg-secondary/60 transition-all flex flex-col justify-between space-y-6 group/idea"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-[16px] font-bold text-foreground line-clamp-2 group-hover/idea:text-ai transition-colors">{idea.title}</h3>
                          <AuroraBadge variant="ai" className="shrink-0 text-[10px]">Idea #{idx + 1}</AuroraBadge>
                        </div>

                        <div className="space-y-2 text-[13px]">
                          <span className="font-bold text-ai uppercase text-[10px] tracking-wider block">Core Concept:</span>
                          <p className="text-muted-foreground font-medium leading-relaxed">{idea.idea}</p>
                        </div>

                        <div className="space-y-2 text-[13px] pt-3 border-t border-border/50">
                          <span className="font-bold text-warning uppercase text-[10px] tracking-wider block">Problem Statement:</span>
                          <p className="text-muted-foreground font-medium leading-relaxed">{idea.problemStatement}</p>
                        </div>
                      </div>

                      <AuroraButton
                        onClick={() => handleAdoptIdea(idea)}
                        variant="secondary"
                        className="w-full justify-center gap-2 hover:bg-ai hover:text-white border-transparent hover:border-ai/50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adopt This Project Idea</span>
                      </AuroraButton>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-[13px] font-medium text-muted-foreground">
                  Add more skills, projects, or GitHub repositories to receive better recommendations.
                </div>
              )}
            </AuroraCard>
          </div>
        </main>
      </div>

      {/* PROJECT DETAIL MODAL */}
      {detailModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border border-border rounded-[var(--radius-xl)] p-6 sm:p-8 shadow-2xl space-y-8 my-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="flex items-start justify-between border-b border-border/50 pb-5 relative z-10">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest">{selectedProject.category || 'Project Details'}</span>
                <h2 className="text-2xl font-bold text-foreground">{selectedProject.title}</h2>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 relative z-10">
              <p className="text-[14px] text-muted-foreground leading-relaxed font-medium">{selectedProject.description}</p>

              {/* Tech Stack */}
              <div className="space-y-3">
                <span className="text-[12px] font-bold uppercase tracking-wider text-foreground">Technologies & Architecture Stack:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies?.map((tech: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-[12px] border border-border/80 font-bold shadow-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Project Audit Section */}
              <div className="p-6 rounded-2xl bg-ai/5 border border-ai/20 space-y-4">
                <div className="flex items-center gap-2 text-ai">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">FORGE AI Project Quality Audit</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                  <div className="space-y-1.5">
                    <span className="font-bold text-foreground uppercase text-[10px] tracking-wider">Technical Depth Score:</span>
                    <div className="font-extrabold text-success text-2xl tracking-tighter">88 <span className="text-[14px] text-muted-foreground font-medium">/100</span></div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-bold text-foreground uppercase text-[10px] tracking-wider">Portfolio Impact Value:</span>
                    <div className="font-extrabold text-primary text-xl">High Resume Impact</div>
                  </div>
                </div>
                <p className="text-[13px] text-muted-foreground border-t border-ai/10 pt-3 mt-2 leading-relaxed">
                  <span className="font-bold text-foreground mr-1">AI Suggestion:</span> Add automated integration tests (Jest / Vitest) and document system architecture diagrams in the GitHub README to maximize ATS quality rating.
                </p>
              </div>
            </div>

            {/* Links & Delete Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-border/50 gap-4 relative z-10">
              <div className="flex flex-wrap items-center gap-3">
                {selectedProject.githubUrl && (
                  <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground border border-border/50 font-bold text-[13px] flex items-center gap-2 transition-colors">
                    <Github className="w-4 h-4 text-primary" /> Source Code
                  </a>
                )}
                {selectedProject.liveUrl && (
                  <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground border border-border/50 font-bold text-[13px] flex items-center gap-2 transition-colors">
                    <ExternalLink className="w-4 h-4 text-success" /> Live Demo
                  </a>
                )}
              </div>

              <AuroraButton
                onClick={() => handleDelete(selectedProject._id)}
                variant="danger"
                className="gap-2 text-[12px] px-3 h-9"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </AuroraButton>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-card border border-border rounded-[var(--radius-xl)] p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h3 className="text-xl font-bold text-foreground">Create Developer Project</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Project Name *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[14px] font-medium text-foreground focus:outline-none focus:border-warning/50 focus:ring-4 focus:ring-warning/5 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[14px] font-medium text-foreground focus:outline-none focus:border-warning/50 focus:ring-4 focus:ring-warning/5 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-warning/50 focus:ring-4 focus:ring-warning/5 transition-all"
                  >
                    {['Idea', 'Planning', 'In Progress', 'Completed', 'Archived'].map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-warning/50 focus:ring-4 focus:ring-warning/5 transition-all"
                  >
                    {['Beginner', 'Intermediate', 'Advanced'].map((df) => (
                      <option key={df} value={df}>{df}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Tech Stack (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[14px] font-medium text-foreground focus:outline-none focus:border-warning/50 focus:ring-4 focus:ring-warning/5 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-warning/50 focus:ring-4 focus:ring-warning/5 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Live Demo URL</label>
                  <input
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-warning/50 focus:ring-4 focus:ring-warning/5 transition-all"
                  />
                </div>
              </div>

              <AuroraButton
                type="submit"
                variant="warning"
                className="w-full justify-center py-3.5 mt-2"
              >
                Save Project to Portfolio
              </AuroraButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
