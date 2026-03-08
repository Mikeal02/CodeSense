
CREATE TABLE public.shared_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_name TEXT NOT NULL,
  active_mode TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  file_summary JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  views INTEGER NOT NULL DEFAULT 0
);

-- Public read access (no auth needed to view reports)
ALTER TABLE public.shared_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared reports"
  ON public.shared_reports
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create shared reports"
  ON public.shared_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update view count"
  ON public.shared_reports
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
