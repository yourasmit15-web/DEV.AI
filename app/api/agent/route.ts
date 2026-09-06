import { NextResponse } from "next/server";

type Provider = "claude" | "gpt" | "deepseek" | "gemini";

type RequestBody = {
  prompt?: string;
  model?: Provider;
  mode?: string;
  filePath?: string;
  fileContent?: string;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function callOpenAICompatible(baseUrl: string, apiKey: string, model: string, system: string, prompt: string) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, temperature: 0.2, messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }),
  });
  if (!response.ok) throw new Error(`Provider request failed (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(apiKey: string, model: string, system: string, prompt: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, max_tokens: 4096, temperature: 0.2, system, messages: [{ role: "user", content: prompt }] }),
  });
  if (!response.ok) throw new Error(`Anthropic request failed (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return data.content?.filter((x: { type?: string }) => x.type === "text").map((x: { text: string }) => x.text).join("\n") ?? "";
}

async function callGemini(apiKey: string, model: string, system: string, prompt: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2 } }),
  });
  if (!response.ok) throw new Error(`Gemini request failed (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.map((x: { text?: string }) => x.text ?? "").join("") ?? "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as RequestBody;
  const prompt = body.prompt?.trim();
  const provider = body.model ?? "gpt";
  if (!prompt) return jsonError("A coding task is required.");

  const system = `You are DEV.AI, a production coding assistant. Work from the supplied task and current file. Return concise engineering guidance and, when code changes are useful, return ONLY a JSON object with this shape: {"message":"short summary","files":[{"path":"relative/path","content":"complete file content"}]}. Never include markdown fences around the JSON. Do not claim to have run commands or tests that you did not actually run. Current mode: ${body.mode ?? "code"}.`;
  const context = `Task: ${prompt}\nCurrent file: ${body.filePath ?? "none"}\nCurrent file content:\n${body.fileContent ?? "(not supplied)"}`;

  try {
    let text = "";
    if (provider === "claude") {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) return jsonError("ANTHROPIC_API_KEY is not configured on the server.", 503);
      text = await callAnthropic(key, process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest", system, context);
    } else if (provider === "gemini") {
      const key = process.env.GEMINI_API_KEY;
      if (!key) return jsonError("GEMINI_API_KEY is not configured on the server.", 503);
      text = await callGemini(key, process.env.GEMINI_MODEL ?? "gemini-1.5-pro", system, context);
    } else if (provider === "deepseek") {
      const key = process.env.DEEPSEEK_API_KEY;
      if (!key) return jsonError("DEEPSEEK_API_KEY is not configured on the server.", 503);
      text = await callOpenAICompatible(process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com", key, process.env.DEEPSEEK_MODEL ?? "deepseek-chat", system, context);
    } else {
      const key = process.env.OPENAI_API_KEY;
      if (!key) return jsonError("OPENAI_API_KEY is not configured on the server.", 503);
      text = await callOpenAICompatible(process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1", key, process.env.OPENAI_MODEL ?? "gpt-4o", system, context);
    }

    let parsed: { message?: string; files?: { path: string; content: string }[] } | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { parsed = null; }
      }
    }

    return NextResponse.json({
      ok: true,
      provider,
      message: parsed?.message ?? text,
      files: parsed?.files ?? [],
      raw: parsed ? undefined : text,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Agent request failed.", 502);
  }
}
