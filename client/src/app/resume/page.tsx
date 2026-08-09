'use client';

import { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle2, AlertTriangle, Sparkles, File, History, ArrowRight, Target, Briefcase } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';

export default function ResumePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [targetRoleOverride, setTargetRoleOverride] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

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

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-500">
              <FileText className="w-4 h-4" />
              <span>AI-Powered Resume ATS & Bullet Rewriter</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Resume ATS Analyzer</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Upload your PDF resume or paste raw text to run FORGE AI ATS evaluation, score rationales, and bullet point rewrites.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload & Input Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span>Resume Source</span>
                </h2>

                {/* PDF File Input */}
                <div className="border-2 border-dashed border-border hover:border-blue-500/50 rounded-xl p-5 text-center space-y-2.5 cursor-pointer transition-colors bg-secondary/40">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
                  <div className="text-xs text-foreground font-medium truncate">
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
                    className="inline-block px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent text-xs text-foreground cursor-pointer border border-border"
                  >
                    Browse PDF File
                  </label>
                </div>

                <textarea
                  rows={4}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Or paste resume plain text here..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none focus:border-blue-500"
                />

                {/* Target Role & Job Description Inputs */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Target Software Role (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Full Stack Developer"
                      value={targetRoleOverride}
                      onChange={(e) => setTargetRoleOverride(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Target Job Description (Optional)</label>
                    <textarea
                      rows={3}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste target job posting description to run comparison..."
                      className="w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>{loading ? 'Analyzing Resume via FORGE AI...' : 'Run AI ATS Analysis'}</span>
                </button>
              </div>

              {/* History List */}
              {history.length > 0 && (
                <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <History className="w-3.5 h-3.5" />
                    <span>Previous Uploads</span>
                  </h3>
                  <div className="space-y-2">
                    {history.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        onClick={() => setAnalysis(item)}
                        className="p-2.5 rounded-lg bg-secondary/60 hover:bg-accent border border-border cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="truncate text-foreground max-w-[150px]">{item.fileName}</span>
                        <span className="font-bold text-blue-500">{item.atsScore}% Score</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Results Display Column */}
            <div className="lg:col-span-2 space-y-6">
              {analysis ? (
                <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-6">
                  {/* Top Score Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                      <span className="text-xs text-muted-foreground">Candidate Resume Audit:</span>
                      <h2 className="text-xl font-bold text-foreground">{analysis.fileName || 'Uploaded Resume'}</h2>
                      <p className="text-xs text-muted-foreground mt-1 max-w-lg">{analysis.summary}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Overall ATS Score</span>
                      <div className="text-4xl font-extrabold text-purple-500">{analysis.atsScore} <span className="text-xs text-muted-foreground font-normal">/ 100</span></div>
                    </div>
                  </div>

                  {/* Section Scores Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-secondary/60 border border-border text-center">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Keywords</div>
                      <div className="text-base font-bold text-foreground mt-1">{analysis.sectionScores?.keywordMatch || 75}%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/60 border border-border text-center">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Tech Skills</div>
                      <div className="text-base font-bold text-foreground mt-1">{analysis.sectionScores?.technicalSkills || 80}%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/60 border border-border text-center">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Projects</div>
                      <div className="text-base font-bold text-foreground mt-1">{analysis.sectionScores?.projects || 82}%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/60 border border-border text-center">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Impact</div>
                      <div className="text-base font-bold text-foreground mt-1">{analysis.sectionScores?.impact || 65}%</div>
                    </div>
                  </div>

                  {/* Improve These First Section */}
                  {analysis.improveTheseFirst && analysis.improveTheseFirst.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                      <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                        <Target className="w-4 h-4" /> Improve These First (Priority Action Items)
                      </span>
                      <ul className="space-y-1 text-xs text-foreground pl-5 list-disc">
                        {analysis.improveTheseFirst.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* BEFORE / AFTER Bullet Rewrites */}
                  {analysis.beforeAfterBulletRewrites && analysis.beforeAfterBulletRewrites.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span>AI Before / After Bullet Rewrites</span>
                      </h3>

                      <div className="space-y-3">
                        {analysis.beforeAfterBulletRewrites.map((rw: any, i: number) => (
                          <div key={i} className="p-4 rounded-xl bg-secondary/60 border border-border space-y-2.5">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">BEFORE</span>
                              <p className="text-xs text-muted-foreground mt-1 italic">"{rw.before}"</p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">AFTER (AI REWRITE)</span>
                              <p className="text-xs text-foreground mt-1 font-semibold text-emerald-600 dark:text-emerald-400">"{rw.after}"</p>
                            </div>
                            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
                              <span className="font-semibold text-foreground">Why this improves ATS score:</span> {rw.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Description Comparison (if available) */}
                  {analysis.jobDescriptionAnalysis && (
                    <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4" /> Job Description Match Audit
                        </span>
                        <div className="text-xs text-muted-foreground">
                          Score Impact: <span className="font-bold text-foreground">{analysis.jobDescriptionAnalysis.scoreBefore}%</span> → <span className="font-bold text-emerald-500">{analysis.jobDescriptionAnalysis.estimatedScoreAfter}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="font-semibold text-emerald-500 block mb-1">Matched Skills</span>
                          <div className="flex flex-wrap gap-1">
                            {analysis.jobDescriptionAnalysis.matchedSkills?.map((s: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[11px] border border-emerald-500/20">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-semibold text-red-500 block mb-1">Missing Skills & Keywords</span>
                          <div className="flex flex-wrap gap-1">
                            {analysis.jobDescriptionAnalysis.missingSkills?.map((s: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[11px] border border-red-500/20">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-16 text-center rounded-2xl bg-card border border-border space-y-4">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                  <h3 className="text-base font-bold text-foreground">No resume analyzed yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Upload a PDF resume file or paste raw text on the left to run complete FORGE AI ATS analysis.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

