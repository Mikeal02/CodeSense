import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileContent, filePath } = await req.json();

    if (!fileContent || !filePath) {
      return new Response(JSON.stringify({ error: "fileContent and filePath are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an elite code reviewer and security auditor. Analyze the given file and return a JSON response using tool calling. Be specific with line numbers and code references. Focus on real, actionable issues — not style nitpicks.

Categories:
- "bug": Logic errors, race conditions, null pointer risks, off-by-one errors, unhandled edge cases
- "security": XSS, injection, auth bypass, exposed secrets, insecure patterns, CSRF
- "performance": Memory leaks, unnecessary re-renders, O(n²) where O(n) is possible, missing memoization
- "improvement": Better patterns, cleaner abstractions, missing error handling, DRY violations

Severity levels: "critical", "high", "medium", "low"

For each issue, provide:
- category, severity, line (approximate), title, description, suggestion (code fix if applicable)

Also provide an overall score 0-100 and a short summary.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Review this file:\n\nFile: ${filePath}\n\n${fileContent}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_code_review",
              description: "Submit the code review results",
              parameters: {
                type: "object",
                properties: {
                  score: { type: "number", description: "Overall code quality score 0-100" },
                  summary: { type: "string", description: "Brief summary of findings" },
                  issues: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", enum: ["bug", "security", "performance", "improvement"] },
                        severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                        line: { type: "number" },
                        title: { type: "string" },
                        description: { type: "string" },
                        suggestion: { type: "string" },
                      },
                      required: ["category", "severity", "title", "description"],
                    },
                  },
                },
                required: ["score", "summary", "issues"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_code_review" } },
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
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const review = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(review), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in code-review function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
