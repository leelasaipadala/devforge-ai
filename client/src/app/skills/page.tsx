'use client';

import {useState, useEffect, useCallback} from 'react';
import { BrainCircuit, Plus, Trash2, CheckCircle2, Sparkles, X, Target, Filter } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';
import { AuroraCard } from '@/components/AuroraCard';
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraBadge } from '@/components/AuroraBadge';
import { AuroraProgress } from '@/components/AuroraProgress';

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
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-primary uppercase mb-2">
                <BrainCircuit className="w-4 h-4" />
                <span>Skill Constellation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Developer Skills Manager</h1>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                Audit your technical inventory, discover role skill gaps, and track proficiency.
              </p>
            </div>

            <AuroraButton
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              variant="primary"
              className="gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Skill</span>
            </AuroraButton>
          </div>

          {/* SECTION 1: Skill Gap Engine */}
          {gapAnalysis && (
            <AuroraCard className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-ai uppercase tracking-wider mb-2">
                    <Target className="w-4 h-4" />
                    <span>Role Skill Gap Benchmark</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{gapAnalysis.targetRole}</h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Target Role Coverage</span>
                  <div className="text-3xl font-extrabold text-ai mt-1">{gapAnalysis.completionPercentage}%</div>
                </div>
              </div>

              {/* Identified Gaps Grid */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">High-Priority Skill Gaps & Recommended Learning Paths</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {gapAnalysis.missing?.map((item: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-2xl bg-secondary/40 border border-border/50 flex flex-col justify-between space-y-4 hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[15px] font-bold text-foreground">{item.name}</div>
                          <div className="text-[13px] text-muted-foreground mt-2 leading-relaxed font-medium">{item.rationale}</div>
                        </div>
                        <AuroraBadge
                          variant={item.priority === 'Critical' ? 'danger' : item.priority === 'High' ? 'warning' : 'primary'}
                        >
                          {item.priority || 'High'} Priority
                        </AuroraBadge>
                      </div>

                      <div className="pt-4 border-t border-border/50 flex items-center justify-between text-[12px] font-semibold">
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
                          className="text-primary hover:underline"
                        >
                          + Add to Skills
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AuroraCard>
          )}

          {/* SECTION 2: Current Technical Skill Inventory */}
          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-foreground">Technical Skill Inventory <span className="text-muted-foreground ml-2">({skills.length})</span></h2>

              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2">
                {['All', ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-secondary/50 text-muted-foreground hover:text-foreground border border-border/50 hover:bg-secondary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredSkills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSkills.map((sk) => (
                  <div
                    key={sk._id}
                    className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all space-y-4 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-[15px] font-bold text-foreground">{sk.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-background text-muted-foreground font-bold border border-border/80 uppercase tracking-wide">{sk.category}</span>
                        </div>
                        <div className="text-[12px] text-primary font-semibold">Proficiency: {sk.proficiency}</div>
                      </div>

                      <button
                        onClick={() => handleDeleteSkill(sk._id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/5 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <AuroraProgress
                      value={
                        sk.proficiency === 'Expert' ? 100 :
                        sk.proficiency === 'Advanced' ? 80 :
                        sk.proficiency === 'Intermediate' ? 60 :
                        sk.proficiency === 'Basic' ? 40 : 20
                      }
                      colorVariant={
                        sk.proficiency === 'Expert' ? 'ai' :
                        sk.proficiency === 'Advanced' ? 'success' :
                        sk.proficiency === 'Intermediate' ? 'primary' :
                        sk.proficiency === 'Basic' ? 'warning' : 'danger'
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <AuroraCard className="flex flex-col items-center justify-center text-center space-y-5 max-w-xl mx-auto my-12 py-12 border-dashed border-2">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                  <BrainCircuit className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No skills added yet</h3>
                  <p className="text-[14px] text-muted-foreground leading-relaxed max-w-sm mx-auto font-medium">
                    Add your programming languages, frameworks, and tools to calculate your career readiness score.
                  </p>
                </div>
                <AuroraButton
                  onClick={() => {
                    resetForm();
                    setModalOpen(true);
                  }}
                  variant="primary"
                >
                  Add Your First Skill
                </AuroraButton>
              </AuroraCard>
            )}
          </div>
        </main>
      </div>

      {/* ADD SKILL MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-[var(--radius-xl)] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h3 className="text-lg font-bold text-foreground">Add Technical Skill</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-5">
              <div>
                <label className="block text-[12px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Skill Name *</label>
                <input
                  type="text"
                  placeholder="e.g. TypeScript, Docker, PostgreSQL"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[14px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Category</label>
                  <select
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Proficiency</label>
                  <select
                    value={newSkill.proficiency}
                    onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl bg-background border border-border text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  >
                    {PROFICIENCY_LEVELS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <AuroraButton
                type="submit"
                variant="primary"
                className="w-full mt-2"
              >
                Save Skill to Inventory
              </AuroraButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
