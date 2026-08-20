'use client';

import {useState, useEffect, useCallback} from 'react';
import { User, Save, Target, Building2, Code, Mail, Sparkles } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';
import { AuroraCard } from '@/components/AuroraCard';
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraBadge } from '@/components/AuroraBadge';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    targetRole: 'Full Stack Developer',
    experienceLevel: 'Intermediate',
    careerGoal: 'Land a Software Engineering position',
    weeklyLearningHours: 15,
    githubUsername: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        targetRole: user.targetRole || 'Full Stack Developer',
        experienceLevel: user.experienceLevel || 'Intermediate',
        careerGoal: user.careerGoal || 'Land a Software Engineering position',
        weeklyLearningHours: user.weeklyLearningHours || 15,
        githubUsername: user.githubUsername || '',
        bio: user.bio || '',
      }));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(formData);
      alert('Profile updated successfully!');
    } catch (err: any) {
      console.warn('Warning updating profile:', err?.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const baseInputClass = "w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60";
  const baseLabelClass = "block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2";
  const handleMobileMenuClick = useCallback(() => setMobileOpen(true), []);


  return (
    <div className="min-h-screen bg-background text-foreground flex selection:bg-primary/20 selection:text-primary">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={handleMobileMenuClick} />

        <main className="p-4 sm:p-6 lg:p-10 space-y-8 max-w-5xl mx-auto w-full">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary mb-2 uppercase tracking-widest">
              <User className="w-4 h-4" />
              <span>Developer Preferences</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Your Developer Profile</h1>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <AuroraCard padded className="space-y-6 border-border/50 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/50 pb-4 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={baseLabelClass}>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={baseInputClass}
                    required
                  />
                </div>

                <div>
                  <label className={baseLabelClass}>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={baseInputClass}
                    required
                  />
                </div>
              </div>
            </AuroraCard>

            <AuroraCard padded className="space-y-6 border-border/50 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/50 pb-4 mb-4">
                <div className="w-8 h-8 rounded-lg bg-secondary-accent/10 flex items-center justify-center text-secondary-accent">
                  <Target className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Career Targets</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={baseLabelClass}>Target Role</label>
                  <select
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    className={baseInputClass}
                  >
                    {['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'AI/ML Engineer', 'Data Analyst', 'Data Scientist', 'DevOps Engineer', 'Mobile Developer'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={baseLabelClass}>Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className={baseInputClass}
                  >
                    {['Student', 'Beginner', 'Intermediate', 'Experienced'].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={baseLabelClass}>Career Goal Statement</label>
                <textarea
                  rows={3}
                  value={formData.careerGoal}
                  onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                  className={baseInputClass}
                  placeholder="e.g. Become a Senior Full Stack Developer focusing on React and Node.js"
                />
              </div>
            </AuroraCard>

            <AuroraCard padded className="space-y-6 border-border/50 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/50 pb-4 mb-4">
                <div className="w-8 h-8 rounded-lg bg-ai/10 flex items-center justify-center text-ai">
                  <Code className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Developer Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={baseLabelClass}>Weekly Learning Hours</label>
                  <input
                    type="number"
                    value={formData.weeklyLearningHours}
                    onChange={(e) => setFormData({ ...formData, weeklyLearningHours: Number(e.target.value) })}
                    className={baseInputClass}
                    min={1}
                    max={168}
                  />
                </div>

                <div>
                  <label className={baseLabelClass}>GitHub Username</label>
                  <input
                    type="text"
                    value={formData.githubUsername}
                    onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                    className={baseInputClass}
                    placeholder="e.g. torvalds"
                  />
                </div>
              </div>

              <div>
                <label className={baseLabelClass}>Developer Bio</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className={baseInputClass}
                  placeholder="Tell us a little about yourself, your background, and your interests."
                />
              </div>
            </AuroraCard>

            <div className="flex justify-end pt-4">
              <AuroraButton
                variant="primary"
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
              >
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Changes...' : 'Save Profile Settings'}</span>
                </span>
              </AuroraButton>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
