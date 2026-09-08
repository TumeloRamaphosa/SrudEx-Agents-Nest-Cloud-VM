/**
 * StudEx OpenMaus cloud gateway.
 *
 * OpenAI-compatible /v1/chat/completions over Cloudflare Workers AI,
 * with optional OpenRouter fallback when OPENROUTER_API_KEY is set.
 *
 * Secrets (wrangler secret put):
 *   GATEWAY_TOKEN        - bearer token required on every request
 *   OPENROUTER_API_KEY   - optional cloud fallback
 */

import { timingSafeEqual } from "node:crypto";

interface Env {
  AI: {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
  };
  GATEWAY_TOKEN: string;
  OPENROUTER_API_KEY?: string;
  DEFAULT_MODEL: string;
}

type ChatMessage = { role: string; content: string };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...CORS },
  });
}

function unauthorized(): Response {
  return json({ error: { message: "unauthorized", type: "auth_error" } }, 401);
}

function authorized(request: Request, env: Env): boolean {
  const expected = env.GATEWAY_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.byteLength !== b.byteLength) return false;
  return timingSafeEqual(a, b);
}

const CLOUD_MODELS = [
  { id: "@cf/meta/llama-3.1-8b-instruct", object: "model", owned_by: "cloudflare" },
  { id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", object: "model", owned_by: "cloudflare" },
  { id: "@cf/qwen/qwen2.5-coder-32b-instruct", object: "model", owned_by: "cloudflare" },
  { id: "openrouter/auto", object: "model", owned_by: "openrouter" },
];

async function chatCompletions(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as {
    model?: string;
    messages?: ChatMessage[];
    stream?: boolean;
    max_tokens?: number;
  };
  const model = body.model || env.DEFAULT_MODEL || "@cf/meta/llama-3.1-8b-instruct";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) {
    return json({ error: { message: "messages required", type: "invalid_request" } }, 400);
  }

  if (model.startsWith("openrouter/") || model.includes("/") && !model.startsWith("@cf/")) {
    return proxyOpenRouter(env, model.replace(/^openrouter\//, ""), messages, !!body.stream);
  }

  const result = await env.AI.run(model, {
    messages,
    max_tokens: body.max_tokens ?? 1024,
    stream: false,
  });

  const content =
    typeof result === "object" && result && "response" in result
      ? String((result as { response: unknown }).response)
      : typeof result === "string"
        ? result
        : JSON.stringify(result);

  return json({
    id: `chatcmpl-${crypto.randomUUID()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: "stop",
      },
    ],
  });
}

async function proxyOpenRouter(
  env: Env,
  model: string,
  messages: ChatMessage[],
  stream: boolean,
): Promise<Response> {
  const key = env.OPENROUTER_API_KEY;
  if (!key) {
    return json(
      { error: { message: "OPENROUTER_API_KEY secret is not set on this Worker", type: "config" } },
      503,
    );
  }
  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      "HTTP-Referer": "https://studex-group.com",
      "X-Title": "StudEx OpenMaus Gateway",
    },
    body: JSON.stringify({ model, messages, stream }),
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json", ...CORS },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return json({ ok: true, service: "studex-openmaus-gateway" });
    }

    if (!authorized(request, env)) return unauthorized();

    if (url.pathname === "/v1/models" && request.method === "GET") {
      return json({ object: "list", data: CLOUD_MODELS });
    }
    if (url.pathname === "/v1/chat/completions" && request.method === "POST") {
      try {
        return await chatCompletions(request, env);
      } catch (error) {
        const message = error instanceof Error ? error.message : "inference failed";
        return json({ error: { message, type: "server_error" } }, 500);
      }
    }
    return json({ error: { message: "not found", type: "invalid_request" } }, 404);
  },
};
