'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Settings as SettingsIcon, Download, Shield, User, Camera, Mail, Lock, KeyRound, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@clerk/nextjs';
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraCard } from '@/components/AuroraCard';

export default function SettingsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, updateUser } = useAuth();
  const { user: clerkUser } = useUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'data'>('profile');

  // Profile Form State
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTargetRole(user.targetRole || '');
    }
  }, [user]);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const updatePayload: any = { name, targetRole };
      if (avatarPreview) updatePayload.avatarUrl = avatarPreview;
      if (avatarFile) updatePayload.avatarFile = avatarFile;
      await updateUser(updatePayload);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!clerkUser) {
      setPasswordError('You must be logged in to change your password.');
      return;
    }
    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in both password fields.');
      return;
    }
    setIsUpdatingPassword(true);
    setPasswordError('');
    try {
      await clerkUser.updatePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        alert('File is too large. Max 1MB allowed.');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportData = () => {
    const data = {
      user: user?.name || 'DevForge Engineer',
      exportedAt: new Date().toISOString(),
      platform: 'DevForge AI Career Command Center',
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devforge-career-data.json';
    a.click();
  };

  const baseInputClass = "w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60";

  const handleMobileMenuClick = useCallback(() => setMobileOpen(true), []);

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={handleMobileMenuClick} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              <SettingsIcon className="w-4 h-4" />
              <span>Platform Configuration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">System Settings</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Tabs Sidebar */}
            <div className="w-full md:w-64 flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar shrink-0">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <User className="w-4 h-4" />
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Shield className="w-4 h-4" />
                Security & Password
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'data'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Download className="w-4 h-4" />
                Data & Privacy
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 w-full space-y-6">
              {activeTab === 'profile' && (
                <AuroraCard padded className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border-border/50 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
                    <p className="text-sm text-muted-foreground mt-1">Update your photo and personal details here.</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div 
                      className="relative group cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        accept="image/jpeg, image/png, image/gif" 
                        className="hidden" 
                      />
                      <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                        {(avatarPreview || user?.avatarUrl) ? (
                          <img src={avatarPreview || user?.avatarUrl!} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl font-bold text-primary">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex flex-col items-center justify-center gap-1 border border-border">
                        <Camera className="w-5 h-5 text-foreground" />
                        <span className="text-[10px] font-bold text-foreground">Update</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground text-sm">Profile Picture</h3>
                      <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={baseInputClass}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5" />
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className={`${baseInputClass} pl-10 opacity-70 cursor-not-allowed`}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed here.</p>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Target Role</label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className={baseInputClass}
                        placeholder="e.g. Full Stack Developer"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end border-t border-border/50 gap-4">
                    {profileSuccess && (
                      <span className="text-sm font-semibold text-success flex items-center gap-1.5 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" />
                        Saved successfully
                      </span>
                    )}
                    <AuroraButton variant="primary" onClick={handleSaveProfile} disabled={isSavingProfile}>
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </AuroraButton>
                  </div>
                </AuroraCard>
              )}

              {activeTab === 'security' && (
                <AuroraCard padded className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border-border/50 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary" />
                      Security & Password
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your password and secure your account.</p>
                  </div>

                  <div className="space-y-6 max-w-md">
                    {passwordError && (
                      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        <span className="text-sm text-destructive">{passwordError}</span>
                      </div>
                    )}
                    
                    {passwordSuccess && (
                      <div className="p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <span className="text-sm font-medium text-success">Password updated successfully!</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={baseInputClass}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={baseInputClass}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="pt-2">
                      <AuroraButton variant="primary" className="w-full" onClick={handleUpdatePassword} disabled={isUpdatingPassword}>
                        {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                      </AuroraButton>
                    </div>
                  </div>
                </AuroraCard>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <AuroraCard padded className="border-border/50 shadow-sm space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Export Data</h2>
                      <p className="text-sm text-muted-foreground mt-1">Download all your career data, skills, and progress as a JSON file.</p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={handleExportData}
                        className="px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-sm font-bold text-foreground flex items-center gap-2 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Career Data</span>
                      </button>
                    </div>
                  </AuroraCard>

                  <AuroraCard padded className="border-danger/20 bg-danger/5 shadow-sm space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-danger flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Danger Zone
                      </h2>
                      <p className="text-sm text-danger/80 mt-1">Permanently delete your DevForge account and all associated data.</p>
                    </div>
                    <div className="pt-2">
                      <button
                        className="px-6 py-3 rounded-xl bg-danger hover:bg-danger/90 text-white text-sm font-bold flex items-center gap-2 transition-colors shadow-md shadow-danger/20"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </AuroraCard>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
