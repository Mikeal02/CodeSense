
-- Persistent sessions table for saving analysis sessions
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_name text NOT NULL,
  source text NOT NULL DEFAULT 'github',
  active_mode text,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  bookmarks jsonb NOT NULL DEFAULT '[]'::jsonb,
  settings jsonb,
  file_count integer DEFAULT 0,
  last_accessed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Allow public access (no auth required for this tool)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can update sessions" ON public.sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete sessions" ON public.sessions FOR DELETE USING (true);

-- Index for quick lookup
CREATE INDEX idx_sessions_repo_name ON public.sessions(repo_name);
CREATE INDEX idx_sessions_last_accessed ON public.sessions(last_accessed_at DESC);
