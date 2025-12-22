const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface GitHubProxyOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  userToken?: string | null;
}

export async function fetchFromGitHubProxy<T = unknown>({
  endpoint,
  method = 'GET',
  userToken
}: GitHubProxyOptions): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };

  // Pass user token if available (not stored, just for this request)
  if (userToken) {
    headers['x-github-token'] = userToken;
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/github-proxy`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ endpoint, method })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `GitHub API request failed: ${response.status}`);
  }

  return response.json();
}
