'use client';

import {useState, useEffect, useCallback} from 'react';
import { FileText, Upload, Sparkles, History, Target, Briefcase } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { AuroraCard } from '@/components/AuroraCard';
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraBadge } from '@/components/AuroraBadge';

export default function ResumePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [targetRoleOverride, setTargetRoleOverride] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadHistory();
    }
  }, [authLoading, isAuthenticated]);

  async function loadHistory() {
    try {
      const res: any = await ApiClient.get('/resume/history');
      setHistory(res.history || []);
      if (res.history && res.history.length > 0) {
        setAnalysis(res.history[0]);
      }
    } catch (err) {
      console.error('Error loading resume history:', err);
    }
  }

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append('resume', file);
      }
      formData.append('rawText', rawText);
      formData.append('targetRoleOverride', targetRoleOverride);
      formData.append('jobDescription', jobDescription);

      const res: any = await ApiClient.uploadFile('/resume/analyze', formData);
      setAnalysis(res.analysis);
      await loadHistory();
    } catch (err) {
      console.error('Error analyzing resume:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleMobileMenuClick = useCallback(() => setMobileOpen(true), []);


  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={handleMobileMenuClick} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <header className="mb-4">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-ai uppercase mb-2">
              <FileText className="w-4 h-4" />
              <span>ATS Analysis Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Resume Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium max-w-2xl">
              Upload your PDF resume or paste raw text to run FORGE AI ATS evaluation, score rationales, and bullet point rewrites.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Upload & Input Column */}
            <div className="lg:col-span-4 space-y-6">
              <AuroraCard className="space-y-6">
                <h2 className="text-[13px] font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                  <Upload className="w-4 h-4 text-primary" />
                  <span>Resume Source</span>
                </h2>

                {/* PDF File Input */}
                <div className="border-2 border-dashed border-border/60 hover:border-primary/50 rounded-2xl p-6 text-center space-y-3 cursor-pointer transition-all bg-secondary/30 hover:bg-secondary group">
                  <div className="w-12 h-12 rounded-2xl bg-background border border-border/80 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-[13px] text-foreground font-medium truncate px-4">
                    {file ? file.name : 'Select PDF resume file'}
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="resume-file-input"
                  />
                  <label
                    htmlFor="resume-file-input"
                    className="inline-block px-4 py-2 rounded-xl bg-background hover:bg-card text-[12px] font-bold text-foreground cursor-pointer border border-border/80 shadow-sm transition-colors"
                  >
                    Browse PDF File
                  </label>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-border/50"></div>
                  <span className="shrink-0 px-3 text-[10px] uppercase font-bold text-muted-foreground">OR</span>
                  <div className="flex-grow border-t border-border/50"></div>
                </div>

                <textarea
                  rows={4}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste resume plain text here..."
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                />

                {/* Target Role & Job Description Inputs */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Target Role <span className="opacity-60">(Optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Full Stack Developer"
                      value={targetRoleOverride}
                      onChange={(e) => setTargetRoleOverride(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/80 text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Job Description <span className="opacity-60">(Optional)</span></label>
                    <textarea
                      rows={3}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste target job posting description..."
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 text-[13px] font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                    />
                  </div>
                </div>

                <AuroraButton
                  onClick={handleAnalyze}
                  disabled={loading}
                  variant="ai"
                  className="w-full justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Analyzing with FORGE AI...' : 'Run Analysis'}</span>
                </AuroraButton>
              </AuroraCard>

              {/* History List */}
              {history.length > 0 && (
                <AuroraCard className="space-y-4">
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <History className="w-4 h-4" />
                    <span>Previous Scans</span>
                  </h3>
                  <div className="space-y-2">
                    {history.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        onClick={() => setAnalysis(item)}
                        className="p-3 rounded-xl bg-secondary/40 hover:bg-secondary border border-border/50 cursor-pointer flex items-center justify-between text-[13px] transition-colors group"
                      >
                        <span className="truncate text-foreground max-w-[150px] font-medium">{item.fileName}</span>
                        <AuroraBadge variant={item.atsScore >= 80 ? 'success' : item.atsScore >= 60 ? 'warning' : 'danger'}>
                          {item.atsScore}%
                        </AuroraBadge>
                      </div>
                    ))}
                  </div>
                </AuroraCard>
              )}
            </div>

            {/* Analysis Results Display Column */}
            <div className="lg:col-span-8 space-y-6">
              {analysis ? (
                <AuroraCard className="space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                  
                  {/* Top Score Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-border/50 pb-6 relative z-10">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Resume Audit Result</span>
                      <h2 className="text-2xl font-bold text-foreground">{analysis.fileName || 'Uploaded Resume'}</h2>
                      <p className="text-[13px] text-muted-foreground mt-2 max-w-xl font-medium leading-relaxed">{analysis.summary}</p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">ATS Score</span>
                      <div className="text-5xl font-extrabold text-ai tracking-tighter">
                        {analysis.atsScore} <span className="text-xl text-muted-foreground font-medium">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Section Scores Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                    <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50 text-center space-y-2">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Keywords</div>
                      <div className="text-2xl font-extrabold text-foreground">{analysis.sectionScores?.keywordMatch || 75}%</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50 text-center space-y-2">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tech Skills</div>
                      <div className="text-2xl font-extrabold text-foreground">{analysis.sectionScores?.technicalSkills || 80}%</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50 text-center space-y-2">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Projects</div>
                      <div className="text-2xl font-extrabold text-foreground">{analysis.sectionScores?.projects || 82}%</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50 text-center space-y-2">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Impact</div>
                      <div className="text-2xl font-extrabold text-foreground">{analysis.sectionScores?.impact || 65}%</div>
                    </div>
                  </div>

                  {/* Improve These First Section */}
                  {analysis.improveTheseFirst && analysis.improveTheseFirst.length > 0 && (
                    <div className="p-5 rounded-2xl bg-warning/10 border border-warning/20 space-y-3 relative z-10">
                      <span className="text-[12px] font-bold uppercase tracking-wider text-warning flex items-center gap-2">
                        <Target className="w-4 h-4" /> Priority Action Items
                      </span>
                      <ul className="space-y-2 text-[13px] font-medium text-foreground pl-6 list-disc marker:text-warning/60">
                        {analysis.improveTheseFirst.map((item: string, idx: number) => (
                          <li key={idx} className="leading-relaxed pl-1">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* BEFORE / AFTER Bullet Rewrites */}
                  {analysis.beforeAfterBulletRewrites && analysis.beforeAfterBulletRewrites.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-border/50 relative z-10">
                      <h3 className="text-[12px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-ai" />
                        <span>AI Bullet Rewrites</span>
                      </h3>

                      <div className="space-y-4">
                        {analysis.beforeAfterBulletRewrites.map((rw: any, i: number) => (
                          <div key={i} className="p-5 rounded-2xl bg-secondary/30 border border-border/60 space-y-4 hover:bg-secondary/60 transition-colors">
                            <div className="space-y-1.5">
                              <AuroraBadge variant="danger" className="text-[9px]">Original</AuroraBadge>
                              <p className="text-[13px] text-muted-foreground italic leading-relaxed">"{rw.before}"</p>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-xl bg-success/5 border border-success/10">
                              <AuroraBadge variant="success" className="text-[9px]">AI Optimized</AuroraBadge>
                              <p className="text-[13px] text-foreground font-semibold leading-relaxed">"{rw.after}"</p>
                            </div>
                            <p className="text-[11px] font-medium text-muted-foreground pt-3 border-t border-border/40">
                              <span className="font-bold text-foreground mr-1">Rationale:</span> {rw.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Description Comparison (if available) */}
                  {analysis.jobDescriptionAnalysis && (
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-5 relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-4">
                        <span className="text-[13px] font-bold uppercase tracking-wide text-primary flex items-center gap-2">
                          <Briefcase className="w-4 h-4" /> Job Description Match Audit
                        </span>
                        <div className="text-[12px] font-medium text-muted-foreground px-3 py-1.5 rounded-lg bg-background border border-border/50">
                          Score Impact: <span className="font-bold text-foreground mx-1">{analysis.jobDescriptionAnalysis.scoreBefore}%</span> → <span className="font-bold text-success ml-1">{analysis.jobDescriptionAnalysis.estimatedScoreAfter}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[13px]">
                        <div className="space-y-3">
                          <span className="font-bold text-success flex items-center gap-2 uppercase tracking-wide text-[11px]">
                            <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                            Matched Keywords
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {analysis.jobDescriptionAnalysis.matchedSkills?.map((s: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 rounded-md bg-success/10 text-success text-[11px] font-bold border border-success/20">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <span className="font-bold text-danger flex items-center gap-2 uppercase tracking-wide text-[11px]">
                            <div className="w-1.5 h-1.5 rounded-full bg-danger"></div>
                            Missing Keywords
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {analysis.jobDescriptionAnalysis.missingSkills?.map((s: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 rounded-md bg-danger/10 text-danger text-[11px] font-bold border border-danger/20">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </AuroraCard>
              ) : (
                <AuroraCard className="flex flex-col items-center justify-center text-center space-y-5 h-full min-h-[400px] border-dashed border-2">
                  <div className="w-16 h-16 rounded-3xl bg-secondary border border-border flex items-center justify-center text-muted-foreground mx-auto">
                    <FileText className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Awaiting Resume Upload</h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed max-w-sm mx-auto font-medium">
                      Upload a PDF or paste raw text to run a complete FORGE AI ATS analysis.
                    </p>
                  </div>
                </AuroraCard>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
