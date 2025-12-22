import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-github-token',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, method = 'GET' } = await req.json();
    
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user-provided token from header (if any)
    const userToken = req.headers.get('x-github-token');
    
    // Use user token if provided, otherwise fall back to server token
    const githubToken = userToken || Deno.env.get('GITHUB_TOKEN');

    if (!githubToken) {
      console.error('No GitHub token available - neither user token nor server token');
      return new Response(
        JSON.stringify({ error: 'GitHub token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log which token type is being used (without exposing the actual token)
    console.log(`Using ${userToken ? 'user-provided' : 'server default'} GitHub token`);
    console.log(`Proxying request to: ${endpoint}`);

    // Build the GitHub API URL
    const githubUrl = endpoint.startsWith('https://') 
      ? endpoint 
      : `https://api.github.com${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    // Make the request to GitHub API
    const githubResponse = await fetch(githubUrl, {
      method,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${githubToken}`,
        'User-Agent': 'Lovable-CodebaseViewer'
      }
    });

    // Get rate limit info for logging
    const rateLimit = githubResponse.headers.get('x-ratelimit-remaining');
    const rateLimitReset = githubResponse.headers.get('x-ratelimit-reset');
    console.log(`GitHub API rate limit remaining: ${rateLimit}, resets at: ${rateLimitReset}`);

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text();
      console.error(`GitHub API error: ${githubResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: `GitHub API error: ${githubResponse.status}`,
          details: errorText 
        }),
        { 
          status: githubResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await githubResponse.json();
    
    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimit || '',
          'X-RateLimit-Reset': rateLimitReset || ''
        } 
      }
    );

  } catch (error: unknown) {
    console.error('Proxy error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
