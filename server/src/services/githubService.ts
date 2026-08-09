import axios from 'axios';
import { config } from '../config/env.js';

export class GitHubService {
  /**
   * Fetch and analyze GitHub profile and repositories with Authorized Token support
   */
  public static async analyzeProfile(username: string, userToken?: string): Promise<any> {
    const cleanUsername = username.trim().replace(/^@/, '');
    if (!cleanUsername) {
      throw new Error('GitHub username is required');
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'DevForge-AI-Client',
    };

    // Prefer User OAuth Token, fallback to Server Token
    const activeToken = userToken || config.githubToken;
    if (activeToken) {
      headers.Authorization = `token ${activeToken}`;
    }

    try {
      // 1. Fetch User Data
      const userRes = await axios.get(`https://api.github.com/users/${cleanUsername}`, { headers });
      const userData = userRes.data;

      // 2. Fetch User Repositories
      const reposRes = await axios.get(`https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=30`, { headers });
      const rawRepos: any[] = reposRes.data || [];

      // Calculate Language Stats
      const langCounts: Record<string, number> = {};
      let totalStars = 0;
      let totalForks = 0;
      let reposWithReadmeCount = 0;

      const repositories = rawRepos.map((repo) => {
        if (repo.language) {
          langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
        }
        totalStars += repo.stargazers_count || 0;
        totalForks += repo.forks_count || 0;

        const hasReadme = Boolean(repo.description && repo.description.length > 10);
        if (hasReadme) reposWithReadmeCount++;

        return {
          name: repo.name,
          description: repo.description || 'No description provided.',
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          language: repo.language || 'Code',
          url: repo.html_url,
          hasReadme,
          updatedAt: new Date(repo.updated_at).toLocaleDateString(),
        };
      });

      const totalLangs = Object.values(langCounts).reduce((a, b) => a + b, 0);
      const topLanguages = Object.entries(langCounts)
        .map(([language, count]) => ({
          language,
          count,
          percentage: totalLangs > 0 ? Math.round((count / totalLangs) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Scoring Calculation
      const repoPts = Math.min(25, userData.public_repos * 2.5);
      const starPts = Math.min(20, (totalStars + totalForks) * 2);
      const followerPts = Math.min(15, userData.followers * 1.5);
      const profilePts = (userData.bio ? 10 : 0) + (userData.avatar_url ? 5 : 0);
      const readmeRatio = repositories.length > 0 ? reposWithReadmeCount / repositories.length : 0;
      const qualityPts = Math.round(readmeRatio * 25);

      const score = Math.min(100, Math.round(repoPts + starPts + followerPts + profilePts + qualityPts));

      const strengths: string[] = [];
      const improvements: string[] = [];
      const recommendedActions: string[] = [];

      if (userData.public_repos >= 5) strengths.push(`Active GitHub presence with ${userData.public_repos} public repositories.`);
      if (topLanguages.length >= 3) strengths.push(`Diverse technology portfolio (${topLanguages.map((l) => l.language).join(', ')}).`);
      if (totalStars > 0) strengths.push(`Received ${totalStars} star(s) across repositories.`);

      if (userData.public_repos < 3) {
        improvements.push('Low repository count. Aim for at least 3-5 complete projects.');
        recommendedActions.push('Publish full-stack projects with live demo links.');
      }
      if (readmeRatio < 0.6) {
        improvements.push('Several repositories are missing descriptive documentation.');
        recommendedActions.push('Add detailed README.md files to all major repositories.');
      }

      return {
        username: userData.login,
        score,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        bio: userData.bio || '',
        avatarUrl: userData.avatar_url || '',
        isAuthorizedAccount: Boolean(activeToken),
        topLanguages,
        repositories,
        strengths,
        improvements,
        recommendedActions,
      };
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error fetching GitHub profile';
      console.error(`[GitHub API Error] ${msg}`);
      throw new Error(`GitHub API Error: ${msg}`);
    }
  }
}
