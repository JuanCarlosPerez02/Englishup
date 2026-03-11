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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "API key not configured" }) };
  }

  // Construir mensajes: si hay system prompt, va primero como role "system"
  const messages = body.system
    ? [{ role: "system", content: body.system }, ...body.messages]
    : body.messages;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",  // rápido, barato, equivalente a Haiku
        max_tokens: body.max_tokens || 1200,
        messages: messages,
      }),
    });

    const data = await response.json();

    // Debug: devolver respuesta completa de OpenAI para diagnóstico
    if (!data.choices || data.choices.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ content: [{ type: "text", text: "DEBUG: " + JSON.stringify(data) }] }),
      };
    }

    const text = data.choices[0].message?.content || "";
    const translated = {
      content: [{ type: "text", text: text }]
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(translated),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Upstream error", detail: err.message }),
    };
  }
};
