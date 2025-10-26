import { NextResponse } from "next/server";

// 1. YOUR API KEYS (Read from environment variables)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // <-- ADDED

// 2. YOUR SITE INFO
const YOUR_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const YOUR_SITE_NAME = "Param Protocol Agent";

// 3. Define the "personas" for your multi-LLM agent
const AGENT_PERSONAS = [
  {
    name: "Persona Analyst",
    model: "anthropic/claude-3.5-sonnet",
    id: "persona_analyst",
    api: "openrouter", // <-- Specify API
    prompt: `
      You are an expert streaming content analyst. Based on the following Netflix user data,
      please generate a synthetic "Viewer Persona".
      - Describe their viewing habits (e.g., binge-watcher, casual viewer).
      - Infer their primary interests (e.g., mythology, history, drama).
      - Give them a persona title (e.g., "The Mythological Explorer").
      Output *only* a JSON object for your analysis.
    `,
  },
  {
    name: "Recommendation Engine",
    model: "meta-llama/llama-3.1-70b-instruct",
    id: "recommendation_engine",
    api: "openrouter", // <-- Specify API
    prompt: `
      You are a world-class recommendation engine. Based on this user's watch history,
      generate a list of 5 new "Actionable Recommendations" that this user would love.
      - Include titles from *other platforms* (e.g., Prime Video, YouTube, Hotstar).
      - For each recommendation, provide a 'title', 'platform', and a brief 'reason'.
      Output *only* a JSON array of these 5 recommendations.
    `,
  },
  {
    name: "Marketing Strategist",
    model: "gemini-2.5-flash-preview-09-2025", // <-- UPDATED model
    id: "marketing_strategist",
    api: "gemini", // <-- UPDATED API
    prompt: `
      You are a marketing strategist. Based on this Netflix user data,
      create a "Targeted Marketing Profile".
      - Identify 3-5 key demographic or interest-based "targeting_keywords".
      - Suggest the "best_ad_platforms" (e.g., YouTube, Instagram, Reddit).
      - Write a single line of "ad_copy" to attract this user.
      Output *only* a JSON object for this marketing profile.
    `,
  },
];

// Helper to encode data for the stream
const encoder = new TextEncoder();
function streamEncode(data: object): Uint8Array {
  // We send each update as a new line
  return encoder.encode(JSON.stringify(data) + "\n");
}

// 4. The main API POST handler - now returns a stream
export async function POST(request: Request) {
  let rawData;
  try {
    const body = await request.json();
    rawData = JSON.parse(body.rawData); // Parse the stringified JSON
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON data provided." }, { status: 400 });
  }

  // 5. Create a ReadableStream to send updates
  const stream = new ReadableStream({
    async start(controller) {

      for (const agent of AGENT_PERSONAS) {
        try {
          // 6. Tell the client which agent is starting
          controller.enqueue(streamEncode({
            agentId: agent.id,
            status: "generating",
            agentName: `${agent.name} (${agent.model})`,
          }));

          let content: string;

          // 7. Check which API to call
          if (agent.api === "gemini") {
            // --- GEMINI API CALL ---
            if (!GEMINI_API_KEY) {
              throw new Error("Server is not configured with a GEMINI_API_KEY.");
            }
            
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${agent.model}:generateContent?key=${GEMINI_API_KEY}`;
            
            const response = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                // Use systemInstruction for the main prompt
                systemInstruction: {
                  parts: [{ text: agent.prompt }]
                },
                contents: [
                  { 
                    role: "user", 
                    parts: [{ text: `Here is the user's data: ${JSON.stringify(rawData)}` }] 
                  }
                ],
                generationConfig: {
                  // Force JSON output
                  responseMimeType: "application/json",
                },
              }),
            });

            if (!response.ok) {
              const errorBody = await response.json();
              console.error(`API Error from ${agent.name} (Gemini):`, JSON.stringify(errorBody, null, 2));
              throw new Error(`Gemini API call failed for ${agent.name}: ${errorBody.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const extractedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!extractedContent) {
              console.error("Invalid response structure from Gemini:", data);
              throw new Error(`Failed to parse response from ${agent.name} (Gemini)`);
            }
            content = extractedContent;

          } else {
            // --- OPENROUTER API CALL (Default) ---
            if (!OPENROUTER_API_KEY) {
              throw new Error("Server is not configured with an OPENROUTER_API_KEY.");
            }

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": YOUR_SITE_URL,
                "X-Title": YOUR_SITE_NAME,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: agent.model,
                messages: [
                  { role: "system", content: agent.prompt },
                  { role: "user", content: `Here is the user's data: ${JSON.stringify(rawData)}` },
                ],
                response_format: { type: "json_object" },
              }),
            });

            if (!response.ok) {
              const errorBody = await response.text();
              console.error(`API Error from ${agent.name} (OpenRouter): ${errorBody}`);
              throw new Error(`OpenRouter API call failed for ${agent.name}: ${errorBody}`);
            }

            const data = await response.json();
            content = data.choices[0].message.content;
          }

          // 8. Tell the client this agent is done and send its data
          controller.enqueue(streamEncode({
            agentId: agent.id,
            status: "completed",
            agentName: `${agent.name} (${agent.model})`,
            data: JSON.parse(content), // This is now safe to parse
          }));

        } catch (err: any) {
          // 9. Send any errors to the client
          console.error(`Error processing agent ${agent.id}:`, err);
          controller.enqueue(streamEncode({
            agentId: agent.id,
            status: "error",
            agentName: `${agent.name} (${agent.model})`,
            error: err.message,
          }));
        }
      }

      // 10. Close the stream
      controller.close();
    },
  });

  // 11. Return the stream
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
