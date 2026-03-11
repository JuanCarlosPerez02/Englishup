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

  if (!event.body) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Empty body" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Parse failed" }) };
  }

  if (!body.messages) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "No messages" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "API key not configured" }) };
  }

  // Convertir mensajes al formato de Gemini
  // Gemini usa "user" y "model" (no "assistant")
  const contents = body.messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  // El system prompt va aparte en Gemini
  const requestBody = {
    contents: contents,
    generationConfig: {
      maxOutputTokens: body.max_tokens || 1200,
      temperature: 0.7,
    }
  };

  if (body.system) {
    requestBody.systemInstruction = {
      parts: [{ text: body.system }]
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.candidates) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ content: [{ type: "text", text: "Error: " + JSON.stringify(data) }] }),
      };
    }

    const text = data.candidates[0]?.content?.parts?.[0]?.text || "(sin respuesta)";

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
