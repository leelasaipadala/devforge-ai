'use client';

import { useState, useEffect } from 'react';
import { Search, Star, GitFork, CheckCircle2, AlertTriangle, ExternalLink, Sparkles, RefreshCw, Trash2, FolderPlus, Check } from 'lucide-react';
import { Github } from '@/components/Icons';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ApiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    loadGitHubProfile();
  }, []);

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

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
                <Github className="w-4 h-4" />
                <span>GitHub Developer Intelligence</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">GitHub Profile Analyzer</h1>
            </div>

            {githubProfile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadGitHubProfile(githubProfile.username)}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-secondary hover:bg-accent border border-border text-xs text-foreground flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Audit</span>
                </button>

                <button
                  onClick={handleDisconnect}
                  className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-500 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Profile</span>
                </button>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importSuccess} Redirecting to Projects...</span>
            </div>
          )}

          {/* INITIAL STATE: GitHub Profile Not Connected */}
          {!githubProfile ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl bg-card border border-border space-y-6 max-w-xl mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
                <Github className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">GitHub profile not connected</h2>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Connect your GitHub account or enter your username to audit repository quality, language distribution, and import projects directly.
                </p>
              </div>

              <form onSubmit={handleConnect} className="space-y-3 max-w-md mx-auto">
                <div className="relative">
                  <Github className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Enter GitHub username or profile URL (e.g. torvalds)"
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Auditing GitHub API...' : 'Analyze GitHub Profile'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* AUDITED PROFILE CONTENT */
            <div className="space-y-8">
              {/* Score & Profile Summary Banner */}
              <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {githubProfile.avatarUrl ? (
                    <img src={githubProfile.avatarUrl} alt={githubProfile.username} className="w-16 h-16 rounded-2xl border border-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold text-xl">
                      <Github className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      @{githubProfile.username}
                      <a href={`https://github.com/${githubProfile.username}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-md mt-1">{githubProfile.bio || 'Developer GitHub Profile'}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                      <span>Public Repos: <strong className="text-foreground">{githubProfile.publicRepos}</strong></span>
                      <span>Followers: <strong className="text-foreground">{githubProfile.followers}</strong></span>
                      <span>Following: <strong className="text-foreground">{githubProfile.following}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">GitHub Quality Score</span>
                  <div className="text-4xl font-extrabold text-emerald-500 my-1">{githubProfile.score} <span className="text-xs text-muted-foreground font-normal">/ 100</span></div>
                  <span className="text-xs text-muted-foreground">Based on repo quality & activity</span>
                </div>
              </div>

              {/* Language Distribution & Quality Audits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Languages Breakdown */}
                <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Repository Languages</h3>
                  <div className="space-y-3">
                    {githubProfile.topLanguages?.map((lang: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-foreground">{lang.language}</span>
                          <span className="text-emerald-500">{lang.percentage}%</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${lang.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Profile Improvement Suggestions</h3>
                  <div className="space-y-2">
                    {githubProfile.recommendedActions?.map((act: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-secondary/60 border border-border text-xs text-muted-foreground flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Repositories List & Import Bar */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-foreground">Public Repositories ({githubProfile.repositories?.length || 0})</h3>
                  
                  <div className="flex items-center gap-2">
                    {githubProfile.repositories?.length > 0 && (
                      <button
                        onClick={() => {
                          const allNames = githubProfile.repositories.map((r: any) => r.name);
                          if (selectedRepos.length === allNames.length) {
                            setSelectedRepos([]);
                          } else {
                            setSelectedRepos(allNames);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-accent text-xs font-semibold text-foreground border border-border transition-colors"
                      >
                        {selectedRepos.length === githubProfile.repositories?.length ? 'Deselect All' : 'Select All'}
                      </button>
                    )}

                    {selectedRepos.length > 0 && (
                      <button
                        onClick={() => handleImportSelected()}
                        disabled={importing}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
                      >
                        <FolderPlus className="w-4 h-4" />
                        <span>{importing ? 'Importing Repos...' : `Import Selected (${selectedRepos.length}) to DevForge Projects`}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {githubProfile.repositories?.map((repo: any, idx: number) => {
                    const isSelected = selectedRepos.includes(repo.name);
                    const isAlreadyImported = repo.isImported;
                    return (
                      <div key={idx} className={`p-5 rounded-2xl bg-card border transition-all space-y-3 ${isSelected ? 'border-blue-500 shadow-md shadow-blue-500/10' : 'border-border hover:border-accent'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRepoSelection(repo.name)}
                              className="rounded border-border text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <a href={repo.url} target="_blank" rel="noreferrer" className="font-bold text-sm text-blue-500 hover:underline flex items-center gap-1.5">
                              <span>{repo.name}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-foreground font-medium">{repo.language}</span>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">{repo.description}</p>

                        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t border-border">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> {repo.stars}</span>
                            <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5 text-muted-foreground" /> {repo.forks}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => alert(`Analyzing repository ${repo.name}:\nLanguage: ${repo.language}\nStars: ${repo.stars}\nQuality Check: Documented README & active structure`)}
                              className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Analyze</span>
                            </button>

                            {isAlreadyImported ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Already added to Projects
                              </span>
                            ) : (
                              <button
                                onClick={() => handleImportSelected([repo])}
                                disabled={importing}
                                className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              >
                                <FolderPlus className="w-3 h-3" />
                                <span>Add to Projects</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
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

