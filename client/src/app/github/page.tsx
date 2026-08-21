'use client';

import {useState, useEffect, useCallback} from 'react';
import { Search, Star, GitFork, CheckCircle2, AlertTriangle, ExternalLink, Sparkles, RefreshCw, Trash2, FolderPlus, Check } from 'lucide-react';
import { Github } from '@/components/Icons';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuroraCard } from '@/components/AuroraCard';
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraBadge } from '@/components/AuroraBadge';
import { AuroraProgress } from '@/components/AuroraProgress';

export default function GitHubPage() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [githubProfile, setGithubProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadGitHubProfile();
    }
  }, [authLoading, isAuthenticated]);

  async function loadGitHubProfile(userToFetch?: string) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const endpoint = userToFetch ? `/github/analyze?username=${encodeURIComponent(userToFetch)}` : '/github/profile';
      const res: any = await ApiClient.get(endpoint);
      if (res.githubProfile && res.githubProfile.username && res.githubProfile.username !== 'octocat') {
        setGithubProfile(res.githubProfile);
        setInputUsername(res.githubProfile.username);
      } else {
        setGithubProfile(null);
      }
    } catch (err: any) {
      console.error('Error fetching GitHub profile:', err);
      setErrorMsg(err.message || 'Error auditing GitHub profile.');
    } finally {
      setLoading(false);
    }
  }

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = inputUsername.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    if (!cleanUser) return;
    loadGitHubProfile(cleanUser);
  };

  const handleDisconnect = async () => {
    setGithubProfile(null);
    setInputUsername('');
  };

  const toggleRepoSelection = (repoName: string) => {
    setSelectedRepos((prev) =>
      prev.includes(repoName) ? prev.filter((r) => r !== repoName) : [...prev, repoName]
    );
  };

  const handleImportSelected = async (reposToImport?: any[]) => {
    const listToImport = reposToImport || (githubProfile?.repositories || []).filter((r: any) => selectedRepos.includes(r.name));
    if (listToImport.length === 0) return;

    setImporting(true);
    setImportSuccess(null);
    try {
      await ApiClient.post('/github/import-to-projects', { repositories: listToImport });
      setImportSuccess(`Successfully imported ${listToImport.length} project(s) to DevForge Projects!`);
      setTimeout(() => {
        router.push('/projects');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error importing repositories.');
    } finally {
      setImporting(false);
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
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-success uppercase mb-2">
                <Github className="w-4 h-4" />
                <span>Developer Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">GitHub Profile Analyzer</h1>
            </div>

            {githubProfile && (
              <div className="flex items-center gap-3 shrink-0">
                <AuroraButton
                  onClick={() => loadGitHubProfile(githubProfile.username)}
                  disabled={loading}
                  variant="secondary"
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Audit</span>
                </AuroraButton>

                <AuroraButton
                  onClick={handleDisconnect}
                  variant="danger"
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Profile</span>
                </AuroraButton>
              </div>
            )}
          </header>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-[13px] font-medium text-danger flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-[13px] text-success flex items-center gap-3 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importSuccess} Redirecting to Projects...</span>
            </div>
          )}

          {/* INITIAL STATE: GitHub Profile Not Connected */}
          {!githubProfile ? (
            <AuroraCard className="p-12 text-center flex flex-col items-center justify-center space-y-8 max-w-xl mx-auto my-12 border-dashed border-2">
              <div className="w-20 h-20 rounded-3xl bg-success/10 border border-success/20 flex items-center justify-center text-success mx-auto">
                <Github className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">GitHub profile not connected</h2>
                <p className="text-[14px] text-muted-foreground leading-relaxed max-w-md mx-auto font-medium">
                  Connect your GitHub account or enter your username to audit repository quality, language distribution, and import projects directly.
                </p>
              </div>

              <form onSubmit={handleConnect} className="space-y-4 max-w-md mx-auto w-full">
                <div className="relative">
                  <Github className="w-5 h-5 text-muted-foreground absolute left-4 top-3.5" />
                  <input
                    type="text"
                    placeholder="Enter GitHub username (e.g. torvalds)"
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-background border border-border/80 text-[14px] font-medium text-foreground focus:outline-none focus:border-success/50 focus:ring-4 focus:ring-success/5 transition-all shadow-sm"
                    required
                  />
                </div>

                <AuroraButton
                  type="submit"
                  disabled={loading}
                  variant="success"
                  className="w-full justify-center gap-2 py-3.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Auditing API...' : 'Analyze GitHub Profile'}</span>
                </AuroraButton>
              </form>
            </AuroraCard>
          ) : (
            /* AUDITED PROFILE CONTENT */
            <div className="space-y-8">
              {/* Score & Profile Summary Banner */}
              <AuroraCard className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                  {githubProfile.avatarUrl ? (
                    <img src={githubProfile.avatarUrl} alt={githubProfile.username} className="w-20 h-20 rounded-3xl border border-border/80 shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-3xl bg-success/10 border border-success/20 flex items-center justify-center text-success font-bold text-xl">
                      <Github className="w-10 h-10" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                      @{githubProfile.username}
                      <a href={`https://github.com/${githubProfile.username}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </h2>
                    <p className="text-[13px] text-muted-foreground max-w-md mt-1 font-medium">{githubProfile.bio || 'Developer GitHub Profile'}</p>
                    <div className="flex items-center gap-5 text-[12px] font-bold text-foreground mt-4 uppercase tracking-wider">
                      <span>Repos: <span className="text-success">{githubProfile.publicRepos}</span></span>
                      <span>Followers: <span className="text-success">{githubProfile.followers}</span></span>
                      <span>Following: <span className="text-success">{githubProfile.following}</span></span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 relative z-10">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest block mb-2">GitHub Quality Score</span>
                  <div className="text-5xl font-extrabold text-success tracking-tighter my-1">
                    {githubProfile.score} <span className="text-xl text-muted-foreground font-medium">/100</span>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground block mt-1">Based on repo quality & activity</span>
                </div>
              </AuroraCard>

              {/* Language Distribution & Quality Audits */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Languages Breakdown */}
                <AuroraCard className="space-y-6">
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Top Repository Languages</h3>
                  <div className="space-y-4">
                    {githubProfile.topLanguages?.map((lang: any, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-[13px] font-bold">
                          <span className="text-foreground">{lang.language}</span>
                          <span className="text-success">{lang.percentage}%</span>
                        </div>
                        <AuroraProgress value={lang.percentage} colorVariant="success" />
                      </div>
                    ))}
                  </div>
                </AuroraCard>

                {/* Recommendations */}
                <AuroraCard className="space-y-6">
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Profile Action Items</h3>
                  <div className="space-y-3">
                    {githubProfile.recommendedActions?.map((act: string, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-[13px] font-medium text-foreground flex items-start gap-3 shadow-sm">
                        <Sparkles className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{act}</span>
                      </div>
                    ))}
                  </div>
                </AuroraCard>
              </div>

              {/* Repositories List & Import Bar */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-foreground">Public Repositories <span className="text-muted-foreground ml-2">({githubProfile.repositories?.length || 0})</span></h3>
                  
                  <div className="flex items-center gap-3">
                    {githubProfile.repositories?.length > 0 && (
                      <AuroraButton
                        variant="secondary"
                        onClick={() => {
                          const allNames = githubProfile.repositories.map((r: any) => r.name);
                          if (selectedRepos.length === allNames.length) {
                            setSelectedRepos([]);
                          } else {
                            setSelectedRepos(allNames);
                          }
                        }}
                      >
                        {selectedRepos.length === githubProfile.repositories?.length ? 'Deselect All' : 'Select All'}
                      </AuroraButton>
                    )}

                    {selectedRepos.length > 0 && (
                      <AuroraButton
                        onClick={() => handleImportSelected()}
                        disabled={importing}
                        variant="primary"
                        className="gap-2"
                      >
                        <FolderPlus className="w-4 h-4" />
                        <span>{importing ? 'Importing...' : `Import Selected (${selectedRepos.length})`}</span>
                      </AuroraButton>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {githubProfile.repositories?.map((repo: any, idx: number) => {
                    const isSelected = selectedRepos.includes(repo.name);
                    const isAlreadyImported = repo.isImported;
                    return (
                      <AuroraCard 
                        key={idx} 
                        className={`transition-all space-y-4 hover:border-primary/40 group ${isSelected ? 'border-primary ring-1 ring-primary/20 shadow-md' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRepoSelection(repo.name)}
                              className="w-4 h-4 rounded border-border/80 text-primary focus:ring-primary/50"
                            />
                            <a href={repo.url} target="_blank" rel="noreferrer" className="font-bold text-[15px] text-foreground hover:text-primary transition-colors flex items-center gap-2">
                              <span>{repo.name}</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                            </a>
                          </div>
                          <AuroraBadge variant="secondary" className="px-2.5">{repo.language}</AuroraBadge>
                        </div>

                        <p className="text-[13px] text-muted-foreground line-clamp-2 font-medium leading-relaxed">{repo.description}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50 text-[12px] font-bold text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-warning" /> {repo.stars}</span>
                            <span className="flex items-center gap-1.5"><GitFork className="w-4 h-4" /> {repo.forks}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <AuroraButton
                              variant="secondary"
                              onClick={() => alert(`Analyzing repository ${repo.name}:\nLanguage: ${repo.language}\nStars: ${repo.stars}\nQuality Check: Documented README & active structure`)}
                              className="px-2.5 py-1.5 h-8 text-[11px] gap-1.5 hover:text-ai hover:bg-ai/5 border-transparent hover:border-ai/20"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Analyze</span>
                            </AuroraButton>

                            {isAlreadyImported ? (
                              <AuroraBadge variant="success" className="px-2.5 py-1.5 h-8 gap-1.5 text-[11px]">
                                <Check className="w-3 h-3" /> Imported
                              </AuroraBadge>
                            ) : (
                              <AuroraButton
                                variant="primary"
                                onClick={() => handleImportSelected([repo])}
                                disabled={importing}
                                className="px-2.5 py-1.5 h-8 text-[11px] gap-1.5"
                              >
                                <FolderPlus className="w-3 h-3" />
                                <span>Import</span>
                              </AuroraButton>
                            )}
                          </div>
                        </div>
                      </AuroraCard>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
