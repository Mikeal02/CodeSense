import { useState, useCallback } from "react";
import { fetchFromGitHubProxy } from "@/lib/githubProxy";

export interface RepoMetadata {
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  language: string | null;
  license: string | null;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  defaultBranch: string;
  size: number; // KB
  topics: string[];
  isArchived: boolean;
  isFork: boolean;
  hasWiki: boolean;
  hasPages: boolean;
  homepage: string | null;
}

export interface ContributorInfo {
  login: string;
  avatarUrl: string;
  contributions: number;
  profileUrl: string;
}

export interface LanguageBreakdown {
  [language: string]: number; // bytes
}

export interface CommitInfo {
  sha: string;
  message: string;
  authorName: string;
  authorLogin: string | null;
  authorAvatar: string | null;
  date: string;
}

export interface CommitActivity {
  week: number; // unix timestamp
  total: number;
  days: number[]; // Sun-Sat
}

export interface RepoInsightsData {
  metadata: RepoMetadata | null;
  contributors: ContributorInfo[];
  languages: LanguageBreakdown;
  recentCommits: CommitInfo[];
  commitActivity: CommitActivity[];
  isLoading: boolean;
}

interface RepoResponse {
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  license: { spdx_id: string } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  size: number;
  topics?: string[];
  archived: boolean;
  fork: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  homepage: string | null;
}

interface ContributorResponse {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

interface CommitResponse {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  author: { login: string; avatar_url: string } | null;
}

export function useRepoInsights() {
  const [data, setData] = useState<RepoInsightsData>({
    metadata: null,
    contributors: [],
    languages: {},
    recentCommits: [],
    commitActivity: [],
    isLoading: false,
  });

  const fetchInsights = useCallback(async (repoName: string, githubToken?: string | null) => {
    setData(prev => ({ ...prev, isLoading: true }));

    const opts = (endpoint: string) => ({ endpoint, userToken: githubToken });

    try {
      // Fetch all in parallel
      const [repoRes, contribRes, langRes, commitsRes, activityRes] = await Promise.allSettled([
        fetchFromGitHubProxy<RepoResponse>(opts(`/repos/${repoName}`)),
        fetchFromGitHubProxy<ContributorResponse[]>(opts(`/repos/${repoName}/contributors?per_page=10`)),
        fetchFromGitHubProxy<LanguageBreakdown>(opts(`/repos/${repoName}/languages`)),
        fetchFromGitHubProxy<CommitResponse[]>(opts(`/repos/${repoName}/commits?per_page=15`)),
        fetchFromGitHubProxy<CommitActivity[]>(opts(`/repos/${repoName}/stats/commit_activity`)),
      ]);

      const metadata: RepoMetadata | null = repoRes.status === 'fulfilled' ? {
        description: repoRes.value.description,
        stars: repoRes.value.stargazers_count,
        forks: repoRes.value.forks_count,
        watchers: repoRes.value.watchers_count,
        openIssues: repoRes.value.open_issues_count,
        language: repoRes.value.language,
        license: repoRes.value.license?.spdx_id || null,
        createdAt: repoRes.value.created_at,
        updatedAt: repoRes.value.updated_at,
        pushedAt: repoRes.value.pushed_at,
        defaultBranch: repoRes.value.default_branch,
        size: repoRes.value.size,
        topics: repoRes.value.topics || [],
        isArchived: repoRes.value.archived,
        isFork: repoRes.value.fork,
        hasWiki: repoRes.value.has_wiki,
        hasPages: repoRes.value.has_pages,
        homepage: repoRes.value.homepage,
      } : null;

      const contributors: ContributorInfo[] = contribRes.status === 'fulfilled'
        ? contribRes.value.map(c => ({
            login: c.login,
            avatarUrl: c.avatar_url,
            contributions: c.contributions,
            profileUrl: c.html_url,
          }))
        : [];

      const languages: LanguageBreakdown = langRes.status === 'fulfilled' ? langRes.value : {};

      const recentCommits: CommitInfo[] = commitsRes.status === 'fulfilled'
        ? commitsRes.value.map(c => ({
            sha: c.sha,
            message: c.commit.message.split('\n')[0],
            authorName: c.commit.author.name,
            authorLogin: c.author?.login || null,
            authorAvatar: c.author?.avatar_url || null,
            date: c.commit.author.date,
          }))
        : [];

      const commitActivity: CommitActivity[] = activityRes.status === 'fulfilled'
        ? (Array.isArray(activityRes.value) ? activityRes.value : [])
        : [];

      setData({
        metadata,
        contributors,
        languages,
        recentCommits,
        commitActivity,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch repo insights:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const clearInsights = useCallback(() => {
    setData({
      metadata: null,
      contributors: [],
      languages: {},
      recentCommits: [],
      commitActivity: [],
      isLoading: false,
    });
  }, []);

  return { ...data, fetchInsights, clearInsights };
}
