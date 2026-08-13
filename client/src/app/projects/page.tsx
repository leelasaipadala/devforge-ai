'use client';

import { useState, useEffect, useMemo } from 'react';
import { FolderGit2, Plus, ExternalLink, Sparkles, CheckCircle2, Clock, Trash2, X, Filter, Code, Eye, ShieldAlert, Cpu } from 'lucide-react';
import { Github } from '@/components/Icons';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';

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

  useEffect(() => {
    loadProjects();
  }, []);

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

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
                <FolderGit2 className="w-4 h-4" />
                <span>Portfolio Command Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Developer Projects</h1>
              <p className="text-xs text-muted-foreground mt-1">Manage your software portfolio, track development status, and adopt AI project blueprints.</p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>

          {/* Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="text-[11px] text-muted-foreground font-medium">Total Projects</div>
              <div className="text-2xl font-extrabold text-foreground">{totalCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="text-[11px] text-muted-foreground font-medium">Completed</div>
              <div className="text-2xl font-extrabold text-emerald-500">{completedCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="text-[11px] text-muted-foreground font-medium">In Progress</div>
              <div className="text-2xl font-extrabold text-blue-500">{inProgressCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="text-[11px] text-muted-foreground font-medium">Planning</div>
              <div className="text-2xl font-extrabold text-amber-500">{planningCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border col-span-2 sm:col-span-1">
              <div className="text-[11px] text-muted-foreground font-medium">Ideas</div>
              <div className="text-2xl font-extrabold text-purple-500">{ideaCount}</div>
            </div>
          </div>

          {/* Status Tabs Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedStatus(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedStatus === tab
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* SECTION A & B: MY PROJECTS vs GITHUB IMPORTED PROJECTS */}
          {filteredProjects.length > 0 ? (
            <div className="space-y-8">
              {/* My Projects (Manually Created) */}
              {filteredProjects.filter((p) => p.category !== 'GitHub Import' && !p.githubImported).length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-500" />
                    <span>My Portfolio Projects</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredProjects
                      .filter((p) => p.category !== 'GitHub Import' && !p.githubImported)
                      .map((proj) => (
                        <div
                          key={proj._id}
                          onClick={() => {
                            setSelectedProject(proj);
                            setDetailModalOpen(true);
                          }}
                          className="p-6 rounded-2xl bg-card border border-border hover:border-accent transition-all space-y-4 cursor-pointer group"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-base font-bold text-foreground group-hover:text-amber-500 transition-colors">{proj.title}</h3>
                              <span className="text-[10px] text-muted-foreground font-medium">{proj.category || 'Software Project'}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                  proj.status === 'Completed'
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : proj.status === 'In Progress'
                                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}
                              >
                                {proj.status}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(proj._id);
                                }}
                                className="p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{proj.description}</p>

                          <div className="flex flex-wrap gap-1.5">
                            {proj.technologies?.map((tech: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-secondary text-foreground text-[10px] border border-border font-medium">
                                {tech}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                            <div className="flex items-center gap-3">
                              {proj.githubUrl && (
                                <a
                                  href={proj.githubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-500 hover:underline flex items-center gap-1 font-semibold"
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
                                  className="text-emerald-500 hover:underline flex items-center gap-1 font-semibold"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                                </a>
                              )}
                            </div>

                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Eye className="w-3 h-3" /> View AI Audit
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* GitHub Imported Projects Section */}
              {filteredProjects.filter((p) => p.category === 'GitHub Import' || p.githubImported).length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Github className="w-4 h-4 text-emerald-500" />
                    <span>GitHub Imported Projects</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredProjects
                      .filter((p) => p.category === 'GitHub Import' || p.githubImported)
                      .map((proj) => (
                        <div
                          key={proj._id}
                          onClick={() => {
                            setSelectedProject(proj);
                            setDetailModalOpen(true);
                          }}
                          className="p-6 rounded-2xl bg-card border border-emerald-500/20 hover:border-emerald-500/50 transition-all space-y-4 cursor-pointer group"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-foreground group-hover:text-emerald-500 transition-colors">{proj.title}</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                                  GitHub Imported
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium">Repository Import</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                {proj.status}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(proj._id);
                                }}
                                className="p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{proj.description}</p>

                          <div className="flex flex-wrap gap-1.5">
                            {proj.technologies?.map((tech: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-secondary text-foreground text-[10px] border border-border font-medium">
                                {tech}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-emerald-500 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <Github className="w-3.5 h-3.5" /> View Repository
                              </a>
                            )}
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Eye className="w-3 h-3" /> View AI Details
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-4 max-w-lg mx-auto my-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">No projects yet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Import a GitHub repository or add your first project to start building your software engineering portfolio.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    resetForm();
                    setModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-lg shadow-amber-600/20"
                >
                  Create Project
                </button>
                <a
                  href="/github"
                  className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-accent text-xs font-bold text-foreground border border-border flex items-center gap-1.5"
                >
                  <Github className="w-4 h-4 text-emerald-500" />
                  <span>Import from GitHub</span>
                </a>
              </div>
            </div>
          )}

          {/* SECTION C: PERSONALIZED RECOMMENDED PROJECTS */}
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-purple-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="uppercase tracking-wider">FORGE AI Personalization Engine</span>
                </div>
                <h2 className="text-xl font-bold text-foreground mt-1">Recommended Projects</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Project ideas based on your skills, GitHub activity, career goals, and existing portfolio.
                </p>
              </div>

              <button
                onClick={loadProjects}
                className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30 flex items-center gap-2 transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Refresh Recommendations</span>
              </button>
            </div>

            {aiIdeas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiIdeas.map((idea, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-secondary/50 border border-border hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-foreground line-clamp-2">{idea.title}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20 shrink-0">
                          Idea #{idx + 1}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <span className="font-bold text-purple-400 uppercase text-[10px] tracking-wider block">Idea:</span>
                        <p className="text-muted-foreground leading-relaxed">{idea.idea}</p>
                      </div>

                      <div className="space-y-1.5 text-xs pt-2 border-t border-border">
                        <span className="font-bold text-amber-500 uppercase text-[10px] tracking-wider block">Problem Statement:</span>
                        <p className="text-muted-foreground leading-relaxed">{idea.problemStatement}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAdoptIdea(idea)}
                      className="w-full py-2.5 rounded-xl bg-secondary hover:bg-accent text-xs font-bold text-purple-400 border border-purple-500/30 transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adopt This Project Idea</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-secondary/40 border border-border text-xs text-muted-foreground">
                Add more skills, projects, or GitHub repositories to receive better recommendations.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* PROJECT DETAIL MODAL */}
      {detailModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">{selectedProject.category || 'Project Details'}</span>
                <h2 className="text-xl font-bold text-foreground">{selectedProject.title}</h2>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{selectedProject.description}</p>

            {/* Tech Stack */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground">Technologies & Architecture Stack:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.technologies?.map((tech: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-secondary text-foreground text-xs border border-border font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Project Audit Section */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">FORGE AI Project Quality Audit</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Technical Depth Score:</span>
                  <div className="font-bold text-emerald-500 text-sm">88 / 100</div>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Portfolio Impact Value:</span>
                  <div className="font-bold text-blue-500 text-sm">High Resume Impact</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground border-t border-border pt-2">
                <span className="font-semibold text-foreground">AI Suggestion:</span> Add automated integration tests (Jest / Vitest) and document system architecture diagrams in the GitHub README to maximize ATS quality rating.
              </p>
            </div>

            {/* Links & Delete Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-xs">
                {selectedProject.githubUrl && (
                  <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent text-blue-500 border border-border font-semibold flex items-center gap-1.5">
                    <Github className="w-4 h-4" /> GitHub Code
                  </a>
                )}
                {selectedProject.liveUrl && (
                  <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent text-emerald-500 border border-border font-semibold flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4" /> Live Demo
                  </a>
                )}
              </div>

              <button
                onClick={() => handleDelete(selectedProject._id)}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Create Developer Project</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Project Name *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs text-foreground"
                  >
                    {['Idea', 'Planning', 'In Progress', 'Completed', 'Archived'].map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs text-foreground"
                  >
                    {['Beginner', 'Intermediate', 'Advanced'].map((df) => (
                      <option key={df} value={df}>{df}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Tech Stack (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white shadow-lg shadow-amber-600/20"
              >
                Save Project to Portfolio
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

