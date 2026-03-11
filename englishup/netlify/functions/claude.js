// netlify/functions/claude.js
exports.handler = async function(event, context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Parse failed" }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "API key not configured" }) };
  }

  // Groq usa el mismo formato que OpenAI
  const messages = [];
  if (body.system) {
    messages.push({ role: "system", content: body.system });
  }
  messages.push(...(body.messages || []));

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // gratis, rápido, muy capaz
        max_tokens: body.max_tokens || 1200,
        messages: messages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.choices) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ content: [{ type: "text", text: "Error: " + JSON.stringify(data) }] }),
      };
    }

    const text = data.choices[0]?.message?.content || "(sin respuesta)";

    // Devolvemos en el mismo formato que usaba la app (compatible con Anthropic)
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ content: [{ type: "text", text }] }),
    };

  } catch (err) {
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Upstream error", detail: err.message }),
    };
  }
};
