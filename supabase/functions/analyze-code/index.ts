import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODE_PROMPTS: Record<string, string> = {
  overview: `You are a senior software architect analyzing a codebase. Provide a comprehensive project overview including:
- What the project does in simple terms
- Project type (web app, API, CLI, library, etc.)
- Tech stack used (frameworks, libraries, languages)
- Entry point of execution
- Main responsibilities and core functionality
Format your response with clear headers and bullet points.`,

  map: `You are a senior software architect analyzing a codebase. Create a detailed project map including:
- Folder structure explanation (why each major folder exists)
- Critical files vs helper files identification
- How different parts of the project connect together
- Data flow between components
- Key architectural patterns used
Format with a visual directory tree and explanations.`,

  flow: `You are a senior software architect analyzing code execution. Explain:
- Step-by-step execution flow when the app starts
- What happens when users interact with key features
- API request/response flows if applicable
- State management patterns
- Event handling chains
Use numbered steps and trace logic across files.`,

  teach: `You are a mentor helping a developer understand code they "wrote" for interview preparation. Explain the project as if they built it:
- Use first-person framing: "In this project, we used..."
- Explain design decisions and tradeoffs
- Highlight clever solutions and why they work
- Prepare them to explain this confidently in interviews
Focus on the "why" behind technical choices.`,

  ask: `You are an expert code assistant. Answer questions about this codebase with:
- Direct, grounded answers based on actual code
- Code snippets when relevant
- Explanations of how things connect
- Honest "I don't see that in the code" if something isn't there
Be precise and cite specific files/functions.`,

  interview: `You are an interview coach preparing a developer. Generate:
- 5-7 project-specific interview questions
- Questions like "Why did you use X instead of Y?"
- Questions about challenges and improvements
- Strong sample answers based on the actual codebase
Format as Q&A pairs with detailed answers.`,

  forgot: `You are helping a developer who hasn't seen this project in 6 months. Provide a quick refresher:
- Purpose of the project (one paragraph)
- High-level architecture overview
- Core user flows
- Key technical decisions
- What you'd need to know to start working on it again
Keep it concise and focused on the essentials.`,

  complexity: `You are a code quality analyst. Identify:
- Overly complex functions (high cyclomatic complexity)
- Files doing too many things (SRP violations)
- Tight coupling between modules
- Fragile areas that might break easily
- Technical debt hotspots
Rate each issue by severity and suggest improvements.`,

  impact: `You are a change impact analyst. For any proposed changes, explain:
- What other parts of the project may be affected
- Direct dependencies that could break
- Side effects to watch for
- What should be tested afterward
- Rollback considerations
Provide concrete file/function references.`,

  resume: `You are a career coach helping create resume content. Generate:
- 3-4 resume bullet points using action verbs
- Tech stack summary for the skills section
- Problem → Solution → Outcome framing
- Metrics or impact statements where applicable
- Project description for portfolio sites
Format professionally for immediate use.`,

  coupling: `You are a software architect analyzing code coupling and dependencies. Analyze this codebase and provide:

## Tightly Coupled Files
Identify files/modules that are TIGHTLY COUPLED (high dependency, hard to change independently):
- List each group of tightly coupled files
- Explain WHY they are coupled (shared state, direct imports, inheritance, etc.)
- Rate the coupling severity (High/Medium/Low)
- Suggest how to reduce coupling if possible

## Loosely Coupled Files  
Identify files/modules that are LOOSELY COUPLED (independent, well-encapsulated):
- List files that follow good separation of concerns
- Explain what makes them loosely coupled
- Highlight good patterns used

## Dependency Map
Create a visual representation showing:
- Which files depend on which
- Central "hub" files that many others depend on
- Isolated modules that could be extracted

## Coupling Metrics Summary
- Overall coupling score (1-10, where 1 is highly coupled, 10 is loosely coupled)
- Most problematic coupling areas
- Recommended refactoring priorities

Format with clear sections, bullet points, and code references.`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { codebase, mode, question } = await req.json();
    
    console.log(`Analyzing codebase in mode: ${mode}`);
    console.log(`Codebase size: ${codebase?.length || 0} characters`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.ask;
    
    let userMessage = `Here is the codebase to analyze:\n\n${codebase}`;
    
    if (question) {
      userMessage += `\n\nUser question: ${question}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in analyze-code function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
