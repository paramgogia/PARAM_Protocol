import { NextResponse } from "next/server";

// 1. YOUR API KEY (Read from environment variables)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 2. YOUR SITE INFO
const YOUR_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const YOUR_SITE_NAME = "Param Protocol Agent";

// 3. Define the "personas" for your multi-LLM agent
const AGENT_PERSONAS = [
  {
    name: "Persona Analyst",
    model: "anthropic/claude-3.5-sonnet", // This model is excellent
    id: "persona_analyst",
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
    model: "meta-llama/llama-3.1-70b-instruct", // This model is excellent
    id: "recommendation_engine",
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
    model: "deepseek/deepseek-chat-v3.1:free", // <-- FIX: Corrected model name
    id: "marketing_strategist",
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
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "Server is not configured with an API key." }, { status: 500 });
  }

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
            agentName: `${agent.name} (${agent.model})`, // This is sent to the UI
          }));

          // 7. Call OpenRouter for this agent
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
              response_format: { type: "json_object" }, // <-- FIX: Force JSON output
            }),
          });

          if (!response.ok) {
            // <-- FIX: Improved error handling
            const errorBody = await response.text();
            console.error(`API Error from ${agent.name}: ${errorBody}`);
            throw new Error(`API call failed for ${agent.name}: ${errorBody}`);
          }

          const data = await response.json();
          const content = data.choices[0].message.content;

          // 8. Tell the client this agent is done and send its data
          controller.enqueue(streamEncode({
            agentId: agent.id,
            status: "completed",
            agentName: `${agent.name} (${agent.model})`,
            data: JSON.parse(content), // This is now safe to parse
          }));

        } catch (err: any) {
          // 9. Send any errors to the client
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
    headers: { "Content-Type": "text/plain" },
  });
}