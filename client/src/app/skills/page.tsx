'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Plus, Trash2, Edit3, CheckCircle2, AlertTriangle, Sparkles, X, Target, Filter } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';

const PROFICIENCY_LEVELS = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
const CATEGORIES = ['Programming', 'Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'AI/ML', 'Tools', 'Testing'];

export default function SkillsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [skills, setSkills] = useState<any[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Programming',
    proficiency: 'Intermediate',
    yearsOfExperience: 1,
    learningStatus: 'In Progress',
    projectEvidence: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const skillsRes: any = await ApiClient.get('/skills');
      const gapRes: any = await ApiClient.get('/skills/gap-analysis');
      setSkills(skillsRes.skills || []);
      setGapAnalysis(gapRes);
    } catch (err) {
      console.error('Error loading skills data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;

    try {
      await ApiClient.post('/skills', newSkill);
      setModalOpen(false);
      resetForm();
      await loadData();
    } catch (err) {
      console.error('Error adding skill:', err);
    }
  };

  const resetForm = () => {
    setNewSkill({
      name: '',
      category: 'Programming',
      proficiency: 'Intermediate',
      yearsOfExperience: 1,
      learningStatus: 'In Progress',
      projectEvidence: '',
    });
  };

  const handleDeleteSkill = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await ApiClient.delete(`/skills/${id}`);
      await loadData();
    } catch (err) {
      console.error('Error deleting skill:', err);
    }
  };

  const filteredSkills = selectedCategory === 'All'
    ? skills
    : skills.filter((s) => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-500">
                <BrainCircuit className="w-4 h-4" />
                <span>Skills & Gap Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Developer Skills Manager</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Audit your technical inventory, discover role skill gaps, and track proficiency.
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Skill</span>
            </button>
          </div>

          {/* SECTION 1: Skill Gap Engine */}
          {gapAnalysis && (
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider">
                    <Target className="w-4 h-4" />
                    <span>Role Skill Gap Benchmark</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mt-1">{gapAnalysis.targetRole}</h2>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Target Role Skill Coverage</span>
                  <div className="text-3xl font-extrabold text-blue-500 mt-0.5">{gapAnalysis.completionPercentage}%</div>
                </div>
              </div>

              {/* Identified Gaps Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">High-Priority Skill Gaps & Recommended Learning Paths</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {gapAnalysis.missing?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-secondary/60 border border-border flex flex-col justify-between space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-foreground">{item.name}</div>
                          <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{item.rationale}</div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 uppercase ${
                            item.priority === 'Critical'
                              ? 'bg-red-500/10 text-red-500 border-red-500/20'
                              : item.priority === 'High'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}
                        >
                          {item.priority || 'High'} Priority
                        </span>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Recommended Path: <strong className="text-foreground">Phase {idx + 1} Roadmap Task</strong></span>
                        <button
                          onClick={() => {
                            setNewSkill({
                              name: item.name,
                              category: 'Backend',
                              proficiency: 'Beginner',
                              yearsOfExperience: 0,
                              learningStatus: 'In Progress',
                              projectEvidence: '',
                            });
                            setModalOpen(true);
                          }}
                          className="text-blue-500 hover:underline font-semibold"
                        >
                          + Add to Skills
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Current Technical Skill Inventory */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-foreground">Technical Skill Inventory ({skills.length})</h2>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                {['All', ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredSkills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map((sk) => (
                  <div
                    key={sk._id}
                    className="p-5 rounded-2xl bg-card border border-border hover:border-accent transition-all space-y-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">{sk.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-semibold">{sk.category}</span>
                        </div>
                        <div className="text-xs text-blue-500 font-semibold mt-1">Proficiency: {sk.proficiency}</div>
                      </div>

                      <button
                        onClick={() => handleDeleteSkill(sk._id)}
                        className="p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{
                          width:
                            sk.proficiency === 'Expert' ? '100%' :
                            sk.proficiency === 'Advanced' ? '80%' :
                            sk.proficiency === 'Intermediate' ? '60%' :
                            sk.proficiency === 'Basic' ? '40%' : '20%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-4 max-w-lg mx-auto my-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mx-auto">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">No skills added yet</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Add your programming languages, frameworks, and tools to calculate your career readiness score.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/20"
                >
                  Add Your First Skill
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ADD SKILL MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Add Technical Skill</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Skill Name *</label>
                <input
                  type="text"
                  placeholder="e.g. TypeScript, Docker, PostgreSQL"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Category</label>
                  <select
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs text-foreground"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Proficiency Level</label>
                  <select
                    value={newSkill.proficiency}
                    onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs text-foreground"
                  >
                    {PROFICIENCY_LEVELS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-lg shadow-blue-600/20"
              >
                Save Skill to Inventory
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

