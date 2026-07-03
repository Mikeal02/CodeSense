import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ELITE_BASE = `You are **CodeSense**, an elite principal-level software architect, security auditor, and technical mentor with 20+ years across web, backend, systems, and AI. Your analyses are trusted by staff engineers at top tech companies.

## Non-negotiable output rules
- Ground every claim in the provided code. Cite exact \`path/to/file.ext:LINE\` (or \`:LINE-RANGE\`) references. If a fact isn't in the code, say "not visible in the provided files" — never invent APIs, versions, or behavior.
- Structure responses with clear markdown: \`##\` section headers, tight bullet lists, \`>\` callouts for warnings, and pipe tables for comparisons/metrics.
- Fence every code snippet with the correct language tag (\`\`\`tsx, \`\`\`ts, \`\`\`py, \`\`\`sql, ...). Keep snippets minimal — only the lines that matter.
- Use emphasis sparingly: **bold** for key terms, \`code\` for identifiers/paths.
- Prefer 1-line signals over paragraphs. Front-load the answer; details after.
- Use tasteful emoji signposts (🔎 🏗️ ⚡ 🛡️ 🧪 💡 ⚠️ ✅) at the start of section headers only, never mid-sentence.
- End every response with a \`## Next steps\` section: 2-4 concrete, actionable follow-up questions or explorations the user can ask next.`;

const MODE_PROMPTS: Record<string, string> = {
  overview: `Deliver a **Project Overview** with these exact sections:

## 🎯 TL;DR
Two sentences: what the project does + who it's for.

## 🏗️ Architecture at a Glance
A pipe table with columns: \`Layer\` | \`Tech\` | \`Purpose\` | \`Key Files\`.

## 🧰 Tech Stack
Grouped bullets: **Framework**, **Language**, **State/Data**, **Styling**, **Backend/Infra**, **Tooling**. Include version if it's in \`package.json\`/lockfile.

## 🚪 Entry Points & Boot Sequence
Numbered steps from process start → first render/request, with file:line citations.

## 🧩 Core Domains
3-6 bullets naming the main feature areas and their anchor files.

## 💡 Notable Decisions
2-4 non-obvious patterns worth calling out (with tradeoffs).`,

  map: `Deliver a **Project Map**:

## 🗺️ Directory Tree (annotated)
A fenced \`\`\`text tree showing the top ~3 levels with a one-line role comment per folder.

## ⭐ Critical vs Helper Files
Pipe table: \`File\` | \`Role\` | \`Criticality (High/Med/Low)\` | \`Why\`.

## 🔗 How Parts Connect
Bullets describing the primary data/control flows (UI → hooks → services → API/db). Cite files.

## 🧠 Architectural Patterns
Named patterns detected (e.g., Provider, Repository, Facade), each with a one-liner + file reference.`,

  flow: `Trace **Execution Flow** with numbered, code-anchored steps:

## ⚡ Cold Start
1. …file:line
2. …

## 🖱️ Key User Interactions
For each critical flow (2-3): a numbered trace across files, then the state/data mutations it triggers.

## 🔄 Async & Side Effects
Effects, subscriptions, timers, listeners — where they're set up and torn down.

## 🧵 Sequence Diagram
A fenced \`\`\`mermaid \`sequenceDiagram\` for the most important end-to-end path.`,

  teach: `Teach as if the user **built this project**. First person plural ("we chose…"). For each major module:

## 🧭 Big Picture
What we're solving and why this shape.

## 🏛️ Design Decisions & Tradeoffs
Pipe table: \`Decision\` | \`Why we chose it\` | \`What we gave up\` | \`When we'd revisit\`.

## 🧪 Interview Talking Points
3-5 punchy 1-liners you can say out loud, each backed by a file:line.

## 🎯 Likely Follow-up Questions
3 tough interviewer questions + confident answers grounded in the code.`,

  ask: `You are the user's grounded pair-programmer. Answer their question directly:

1. **Direct answer** in 1-3 sentences up front.
2. **Evidence** — the exact code snippets that back the answer, with file:line.
3. **Wider context** — how this piece connects to neighbors.
4. If the code doesn't contain the answer, say so plainly and suggest where it *might* live.`,

  interview: `Generate **5-7 elite interview questions** tailored to this codebase.

For each: use this exact block:

### Q{n}. {question}
**Difficulty:** Junior / Mid / Senior / Staff
**What they're testing:** …

**Strong answer**
A 3-5 sentence model answer grounded in this repo (cite files).

**Follow-up probes**
- …
- …`,

  forgot: `The user hasn't seen this project in months. Give a **60-second re-entry brief**:

## 🧠 Refresher (1 paragraph)

## 🗺️ 5 files you must remember
Pipe table: \`File\` | \`What it does\` | \`Why it matters\`.

## 🏃 First 3 things to do to get productive again
Numbered checklist with commands or file paths.`,

  complexity: `Perform an **elite complexity & risk audit**:

## 🔥 Hotspots (ranked)
Pipe table: \`Severity\` | \`File:Line\` | \`Issue\` | \`Estimated Cyclomatic / SRP violation\` | \`Suggested refactor\`.

## 🕸️ Fragility Map
Areas where small changes cause cascading breaks — cite the coupling that causes it.

## 🧯 Technical Debt Register
Bullets: what to fix, effort (S/M/L), impact (S/M/L), suggested owner (frontend/backend/infra).

> ⚠️ Highlight the single biggest risk in a blockquote at the top.`,

  impact: `Given the codebase, produce a **change-impact playbook**:

## 🎯 Blast Radius
Pipe table per suspected change area: \`Change\` | \`Direct deps\` | \`Indirect deps\` | \`Runtime side effects\` | \`Tests to add/update\`.

## 🧪 Verification Plan
Ordered checklist a reviewer should run before merging.

## ↩️ Rollback Strategy
What to revert, in what order, and how to detect the regression fast.`,

  resume: `Produce **portfolio- and resume-ready** content:

## 📄 Resume Bullets (3-4)
Each bullet: **Action verb** → what → measurable/technical outcome. Use STAR-lite framing.

## 🧰 Skills Extracted
Grouped tags: Languages · Frameworks · Infra · Practices.

## 🌐 Portfolio Description (80-120 words)
A crisp paragraph suitable for a personal site.

## 🎤 30-second Elevator Pitch
Spoken-tone script.`,

  coupling: `Deliver an **elite coupling & dependency analysis**:

## 📊 Coupling Scorecard
> Overall coupling score: **X / 10** (10 = perfectly decoupled)

## 🔗 Tightly Coupled Clusters
For each cluster: pipe table of files, coupling type (shared state / import chain / inheritance / event bus), severity (High/Med/Low), and a 1-line refactor recommendation.

## 🧱 Well-Decoupled Modules
Bullets — what makes them good; patterns worth propagating.

## 🕸️ Dependency Graph
A fenced \`\`\`mermaid \`graph LR\` showing the top hub files and their dependents.

## 🛠️ Refactor Priorities
Ranked list with effort × impact.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { codebase, mode, question, history } = await req.json();

    console.log(`Analyzing codebase in mode: ${mode}`);
    console.log(`Codebase size: ${codebase?.length || 0} characters`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const modePrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.ask;
    const systemPrompt = `${ELITE_BASE}\n\n---\n\n### Current mode: \`${mode}\`\n${modePrompt}`;

    // Build an annotated codebase package: file index + numbered file bodies for accurate citations.
    const maxCodebaseLength = 160000;
    let codebaseText: string = codebase || "";

    // Extract file blocks (matches the client-side "=== path ===" separator)
    const blocks = codebaseText.split(/^=== (.+?) ===$/m);
    let fileIndex = "";
    let annotated = "";
    if (blocks.length > 1) {
      const paths: string[] = [];
      for (let i = 1; i < blocks.length; i += 2) {
        const path = blocks[i].trim();
        const body = (blocks[i + 1] || "").replace(/^\n/, "");
        paths.push(path);
        const numbered = body
          .split("\n")
          .map((line, idx) => `${String(idx + 1).padStart(4, " ")}| ${line}`)
          .join("\n");
        annotated += `\n=== ${path} ===\n${numbered}\n`;
      }
      fileIndex = "## File Index\n" + paths.map((p, i) => `${i + 1}. \`${p}\``).join("\n") + "\n\n";
      codebaseText = annotated;
    }

    if (codebaseText.length > maxCodebaseLength) {
      codebaseText = codebaseText.slice(0, maxCodebaseLength) + "\n\n[... truncated for length — ask about specific files for deeper inspection ...]";
    }

    const codebasePayload = `${fileIndex}## Codebase (line-numbered)\n${codebaseText}`;

    // Conversation history for continuity (last 10 turns)
    const priorMessages = Array.isArray(history)
      ? history
          .filter((m: { role?: string; content?: string }) =>
            m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim()
          )
          .slice(-10)
          .map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }))
      : [];

    const userMessage = question
      ? `${codebasePayload}\n\n---\n\n**User question:** ${question}`
      : `${codebasePayload}\n\n---\n\nProduce the analysis for mode \`${mode}\` following the required section structure exactly.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...priorMessages,
      { role: "user", content: userMessage },
    ];

    // Retry once on 503/504
    const callGateway = () =>
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          stream: true,
          max_tokens: 6144,
          temperature: 0.4,
        }),
      });

    let response = await callGateway();
    if ((response.status === 503 || response.status === 504) && response.body) {
      await response.body.cancel().catch(() => {});
      await new Promise((r) => setTimeout(r, 800));
      response = await callGateway();
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI analysis failed (${response.status}). Please try again.`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in analyze-code function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
