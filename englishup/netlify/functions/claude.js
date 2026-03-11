// netlify/functions/claude.js

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  // Leer body de forma robusta — soporta tanto text como json
  let body;
  try {
    const text = await request.text();
    body = JSON.parse(text);
  } catch (e) {
    return new Response(JSON.stringify({ error: "Bad request", detail: e.message }), { status: 400, headers: corsHeaders });
  }

  if (!body || !body.messages) {
    return new Response(JSON.stringify({ error: "Missing messages field" }), { status: 400, headers: corsHeaders });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), { status: 500, headers: corsHeaders });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: body.max_tokens || 1200,
        system: body.system || "",
        messages: body.messages,
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Upstream error", detail: err.message }), {
      status: 502,
      headers: corsHeaders,
    });
  }
};

export const config = {
  path: "/api/claude",
};
