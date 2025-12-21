import { useState } from "react";
import { Github, Search, Loader2, Lock, Globe, Star, GitFork } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
}

interface GitHubRepoSelectorProps {
  onSelectRepo: (repoUrl: string) => void;
  onClose: () => void;
  isLoading: boolean;
  githubToken?: string;
}

const GitHubRepoSelector = ({ onSelectRepo, onClose, isLoading, githubToken }: GitHubRepoSelectorProps) => {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<Repository[]>([]);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const fetchUserRepos = async () => {
    if (!username.trim()) return;
    
    setFetchingRepos(true);
    setError(null);
    setRepos([]);

    try {
      const headers: HeadersInit = { Accept: 'application/vnd.github.v3+json' };
      if (githubToken) {
        headers.Authorization = `Bearer ${githubToken}`;
      }
      
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
        { headers }
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found");
        }
        throw new Error("Failed to fetch repositories");
      }
      
      const data = await response.json();
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch repos");
    } finally {
      setFetchingRepos(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchUserRepos();
    }
  };

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (repo.description?.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Github className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Connect GitHub Account</h3>
              <p className="text-xs text-muted-foreground">Browse and select a repository</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>

        {/* Username Input */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Enter GitHub username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={fetchingRepos}
            />
            <Button 
              onClick={fetchUserRepos} 
              disabled={!username.trim() || fetchingRepos}
            >
              {fetchingRepos ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <p className="text-destructive text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Repo List */}
        {repos.length > 0 && (
          <>
            <div className="px-4 py-2 border-b border-border">
              <Input
                placeholder="Filter repositories..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-9"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {filteredRepos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No matching repositories</p>
              ) : (
                <div className="space-y-1">
                  {filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => onSelectRepo(repo.html_url)}
                      disabled={isLoading || repo.private}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg transition-colors",
                        "hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed",
                        "border border-transparent hover:border-border/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {repo.private ? (
                              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                            <span className="font-medium text-foreground truncate">{repo.name}</span>
                            {repo.private && (
                              <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">Private</span>
                            )}
                          </div>
                          {repo.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{repo.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {repo.language && (
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                {repo.language}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {repo.stargazers_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitFork className="w-3 h-3" />
                              {repo.forks_count}
                            </span>
                            <span>Updated {formatDate(repo.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {repos.length === 0 && !fetchingRepos && !error && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-muted-foreground">
              <Github className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Enter a GitHub username to browse their public repositories</p>
            </div>
          </div>
        )}

        {fetchingRepos && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Fetching repositories...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubRepoSelector;
