import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import OpenAI from "openai";
import { createStorage, type Storage } from "./storage";
import { constantTimeEqual, createToken, verifyToken } from "../shared/auth";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  OPENAI_API_KEY?: string;
  HIGGSFIELD_KEY_ID?: string;
  HIGGSFIELD_KEY_SECRET?: string;
  AGENTMAIL_TOKEN?: string;
  AUTH_USERNAME?: string;
  AUTH_PASSWORD?: string;
  AUTH_SECRET?: string;
}

type Vars = { storage: Storage };

const app = new Hono<{ Bindings: Env; Variables: Vars }>();
let warnedCredentialDefaults = false;
let warnedSecretDefault = false;

function warnAuthDefaults(env: Env): void {
  if ((!env.AUTH_USERNAME || !env.AUTH_PASSWORD) && !warnedCredentialDefaults) {
    console.warn("AUTH_USERNAME/AUTH_PASSWORD not set — using insecure defaults");
    warnedCredentialDefaults = true;
  }
  if (!env.AUTH_SECRET && !warnedSecretDefault) {
    console.warn("AUTH_SECRET not set — using insecure default");
    warnedSecretDefault = true;
  }
}

// Attach a per-request D1-backed storage instance.
app.use("/api/*", async (c, next) => {
  c.set("storage", createStorage(c.env.DB));
  await next();
});

app.use("/api/*", async (c, next) => {
  warnAuthDefaults(c.env);
  const path = new URL(c.req.url).pathname;
  if (path === "/api/auth/login" || path === "/api/webhooks/payfast") {
    return next();
  }

  const secret = c.env.AUTH_SECRET || "dev-insecure-secret-change-me";
  const authorization = c.req.header("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const user = token ? await verifyToken(token, secret) : null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  await next();
});

function getOpenAI(env: Env) {
  return new OpenAI({ apiKey: env.OPENAI_API_KEY || "no-key" });
}

/** Deduct credits from a client. Returns null on success or an error message. */
async function deductCredits(
  storage: Storage,
  clientId: number | undefined,
  amount: number,
  description: string,
): Promise<string | null> {
  if (!clientId) return null; // no client context = free usage (backwards compat)
  const client = await storage.getClientById(clientId);
  if (!client) return "Client not found";
  if (client.aiCredits < amount)
    return `Insufficient credits (have ${client.aiCredits}, need ${amount})`;
  const newBalance = client.aiCredits - amount;
  await storage.updateClientCredits(clientId, newBalance);
  await storage.addTransaction({
    clientId,
    amount: -amount,
    type: "usage",
    description,
    balanceAfter: newBalance,
    paymentRef: null,
    createdAt: new Date().toISOString(),
  });
  return null;
}

const TIER_ALLOCATIONS: Record<string, number> = {
  "meat-os": 500,
  "agency-os": 2000,
  "marketplace-os": 5000,
};

const CREDIT_COSTS: Record<string, number> = {
  "gpt-4o-caption": 5,
  "higgsfield-image": 10,
  "higgsfield-video": 25,
  "chat-gpt4o": 3,
  "chat-claude": 4,
  "chat-gemini": 2,
  "chat-perplexity": 2,
};

app.post("/api/auth/login", async (c) => {
  const { username: submittedUsername, password: submittedPassword } = await c.req.json<{
    username?: string;
    password?: string;
  }>();
  const username = c.env.AUTH_USERNAME || "admin";
  const password = c.env.AUTH_PASSWORD || "changeme";
  const validCredentials =
    typeof submittedUsername === "string" &&
    typeof submittedPassword === "string" &&
    constantTimeEqual(submittedUsername, username) &&
    constantTimeEqual(submittedPassword, password);

  if (!validCredentials) return c.json({ error: "Invalid credentials" }, 401);

  const token = await createToken({ username }, c.env.AUTH_SECRET || "dev-insecure-secret-change-me");
  return c.json({ token, user: { username } });
});

app.get("/api/auth/me", async (c) => {
  const secret = c.env.AUTH_SECRET || "dev-insecure-secret-change-me";
  const authorization = c.req.header("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const user = token ? await verifyToken(token, secret) : null;
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ user });
});

// ── Content ──────────────────────────────────────────────────────────
app.get("/api/content", async (c) => {
  try {
    return c.json(await c.get("storage").getAllContent());
  } catch {
    return c.json({ error: "Failed to fetch content" }, 500);
  }
});

app.patch("/api/content/:id/status", async (c) => {
  try {
    const storage = c.get("storage");
    const id = parseInt(c.req.param("id"));
    const { status, note } = await c.req.json<{ status: string; note?: string }>();
    if (!status) return c.json({ error: "status is required" }, 400);
    await storage.updateContentStatus(id, status, note);
    return c.json(await storage.getContentById(id));
  } catch {
    return c.json({ error: "Failed to update status" }, 500);
  }
});

app.post("/api/content/:id/post", async (c) => {
  try {
    const storage = c.get("storage");
    const id = parseInt(c.req.param("id"));
    await storage.markPosted(id, null, null);
    const updated = await storage.getContentById(id);
    return c.json({ success: true, message: "Queued for posting", item: updated });
  } catch {
    return c.json({ error: "Failed to post content" }, 500);
  }
});

app.patch("/api/content/:id/caption", (c) =>
  c.json({ success: true, message: "Caption noted" }),
);

// ── Calendar ───────────────────────────────────────────────────────────
app.get("/api/calendar", async (c) => {
  try {
    return c.json(await c.get("storage").getAllEvents());
  } catch {
    return c.json({ error: "Failed to fetch calendar" }, 500);
  }
});

// ── Analytics / Shopify / Facebook (static mock data) ──────────────────
app.get("/api/analytics/shopify", (c) =>
  c.json({ revenue: 43585, orders: 4, topProduct: "Wagyu Burger Patties" }),
);

app.get("/api/shopify/unfulfilled", (c) =>
  c.json({
    count: 37,
    total: 125561.15,
    oldest: "#1221 Apr 2024",
    orders: [
      { order: "#1221", initials: "R.G.", amount: 29325, daysWaiting: 420 },
      { order: "#1487", initials: "N.M.", amount: 12450, daysWaiting: 380 },
      { order: "#1592", initials: "T.D.", amount: 8900, daysWaiting: 341 },
      { order: "#1634", initials: "J.V.", amount: 6700, daysWaiting: 298 },
      { order: "#1701", initials: "A.P.", amount: 5200, daysWaiting: 240 },
      { order: "#1744", initials: "M.S.", amount: 4800, daysWaiting: 195 },
      { order: "#1802", initials: "B.K.", amount: 3750, daysWaiting: 160 },
    ],
  }),
);

app.get("/api/shopify/today", (c) =>
  c.json({ orders: 4, revenue: 43585, topOrder: "R29,325 Radik G." }),
);

const MOCK_FB_ADS = {
  account: { id: "act_560666565541381", name: "StudEx Meat", currency: "ZAR", balance: 0, daily_limit: 3571 },
  campaigns: [
    { id: "120245475014320003", name: "Father's Day Tomahawk", status: "ACTIVE", objective: "OUTCOME_SALES", spend: 0, impressions: 0, clicks: 0, reach: 0 },
  ],
  adsets: [
    { id: "120245048870003", name: "SA Ages 25–55", status: "ACTIVE", daily_budget: 10000, targeting: "South Africa · Ages 25–55 · All genders", impressions: 0, clicks: 0, ctr: 0 },
  ],
  ads: [
    { id: "120245514004840003", name: "Father's Day Tomahawk Ad", status: "ACTIVE", creative_type: "Image", impressions: 0, clicks: 0, spend: 0 },
  ],
  billing: { method: "MasterCard *8234", status: "Valid", balance: "R0", daily_limit: "R3,571" },
};

app.get("/api/facebook/ads", (c) => c.json(MOCK_FB_ADS));

// ── Caption generation (OpenAI streaming, costs 5 credits) ─────────────
app.post("/api/generate/caption", async (c) => {
  const storage = c.get("storage");
  const { title, caption, campaign, tone, clientId } = await c.req.json<{
    title: string; caption?: string; campaign?: string; tone: string; clientId?: number;
  }>();

  const creditError = await deductCredits(storage, clientId, 5, "GPT-4o caption generation");
  if (creditError) return c.json({ error: creditError }, 402);

  const toneInstructions: Record<string, string> = {
    Premium: "sophisticated, refined, luxury brand voice — think high-end editorial",
    Bold: "powerful, direct, confident — no fluff, pure impact",
    Emotional: "warm, heartfelt, storytelling — connects on an emotional level",
    Funny: "witty, playful, South African humour — light tone with braai culture references",
  };
  const toneGuide = toneInstructions[tone] || toneInstructions.Premium;

  const prompt = `You are the social media copywriter for StudEx Meat — a premium South African Wagyu beef brand based in Johannesburg. Write a compelling Instagram/Facebook caption for the following content.

Brand voice: ${toneGuide}

Content title: ${title}
Campaign: ${campaign || "General"}
Original caption draft: ${caption || "None"}

Requirements:
- Open with a powerful hook (first line must stop the scroll)
- Include a clear call to action linking to studexmeat.com
- Use relevant emojis sparingly — no more than 3-4
- Include 6-8 hashtags at the end (mix of broad and niche)
- Keep it under 200 words
- South African context — reference braai culture, JHB delivery, local pride where appropriate
- For Father's Day campaign: emphasize gifting premium experiences
- For Hwende campaign: connect to champion, MMA, fighting spirit
- For Youth Day: patriotism, building the nation

Write ONLY the caption. No intro, no explanation.`;

  const openai = getOpenAI(c.env);
  return streamSSE(c, async (stream) => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        stream: true,
        max_tokens: 400,
      });
      for await (const chunk of completion) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) await stream.writeSSE({ data: JSON.stringify({ text }) });
      }
      await stream.writeSSE({ data: "[DONE]" });
    } catch (err: any) {
      await stream.writeSSE({ data: JSON.stringify({ text: `\n\n⚠️ Error: ${err.message}` }) });
    }
  });
});

// ── Higgsfield image/video generation ──────────────────────────────────
app.post("/api/higgsfield/generate", async (c) => {
  const storage = c.get("storage");
  const { prompt, aspect = "1024x1024", mode = "image", clientId } = await c.req.json<any>();

  const creditCost = mode === "video" ? 25 : 10;
  const creditError = await deductCredits(storage, clientId, creditCost, `Higgsfield ${mode} generation`);
  if (creditError) return c.json({ error: creditError }, 402);

  const keyId = c.env.HIGGSFIELD_KEY_ID;
  const keySecret = c.env.HIGGSFIELD_KEY_SECRET;
  if (!keyId || !keySecret) return c.json({ error: "HIGGSFIELD_KEY_MISSING" });

  const headers = { "hf-api-key": keyId, "hf-secret": keySecret, "Content-Type": "application/json" };
  const [width, height] = String(aspect).split("x").map(Number);

  try {
    const submitRes = await fetch("https://platform.higgsfield.ai/v1/text2image/soul", {
      method: "POST",
      headers,
      body: JSON.stringify({
        params: { prompt, width_and_height: `${width}x${height}`, enhance_prompt: true, quality: "720p", batch_size: 1 },
      }),
    });
    if (!submitRes.ok) return c.json({ error: `Higgsfield submit failed: ${await submitRes.text()}` }, 500);

    const submitData = await submitRes.json<any>();
    const jobId = submitData?.jobs?.[0]?.id || submitData?.id;
    if (!jobId) return c.json({ error: "No job ID returned from Higgsfield" }, 500);

    const pollUrl = `https://platform.higgsfield.ai/v1/jobs/${jobId}`;
    let imageUrl: string | null = null;
    for (let i = 0; i < 45; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollData = await (await fetch(pollUrl, { headers })).json<any>();
      if (pollData.status === "completed") {
        imageUrl = pollData?.results?.raw?.url || pollData?.jobs?.[0]?.results?.raw?.url;
        break;
      }
      if (pollData.status === "failed") return c.json({ error: "Higgsfield generation failed" }, 500);
    }
    if (!imageUrl) return c.json({ error: "Higgsfield timed out after 90s" }, 500);

    if (mode === "video") {
      const vidRes = await fetch("https://platform.higgsfield.ai/v1/image2video/dop", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "dop-turbo",
          prompt: `${prompt}, cinematic motion, slow zoom`,
          input_images: [imageUrl],
          enhance_prompt: true,
        }),
      });
      if (!vidRes.ok) return c.json({ url: imageUrl, type: "image" });
      const vidData = await vidRes.json<any>();
      const vidJobId = vidData?.jobs?.[0]?.id || vidData?.id;
      if (!vidJobId) return c.json({ url: imageUrl, type: "image" });
      const vidPollUrl = `https://platform.higgsfield.ai/v1/jobs/${vidJobId}`;
      let videoUrl: string | null = null;
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const vpData = await (await fetch(vidPollUrl, { headers })).json<any>();
        if (vpData.status === "completed") { videoUrl = vpData?.results?.raw?.url; break; }
        if (vpData.status === "failed") break;
      }
      return c.json({ url: videoUrl || imageUrl, type: videoUrl ? "video" : "image" });
    }
    return c.json({ url: imageUrl, type: "image" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ── Messages ───────────────────────────────────────────────────────────
app.post("/api/messages/sync", async (c) => {
  try {
    const storage = c.get("storage");
    const { messages } = await c.req.json<{ messages: any[] }>();
    if (!Array.isArray(messages)) return c.json({ error: "messages must be an array" }, 400);
    const now = new Date().toISOString();
    const normalised = messages.map((m: any) => ({
      source: m.source || "unknown",
      messageId: m.messageId || m.id || `${m.source}-${Math.random()}`,
      inbox: m.inbox || "",
      fromAddr: m.fromAddr || m.from || "",
      subject: m.subject || "(no subject)",
      snippet: (m.snippet || "").slice(0, 200),
      date: m.date || now,
      isRead: m.isRead ?? true,
      labels: JSON.stringify(m.labels || []),
      syncedAt: now,
    }));
    await storage.upsertMessages(normalised);
    return c.json({ ok: true, synced: normalised.length });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get("/api/messages", async (c) => {
  try {
    const source = c.req.query("source");
    return c.json(await c.get("storage").getMessages(source));
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get("/api/agentmail/messages", async (c) => {
  const AGENTMAIL_TOKEN = c.env.AGENTMAIL_TOKEN || "";
  const INBOXES = [
    "t.rama.studexgroup.cto@agentmail.to",
    "studexgroup@agentmail.to",
    "studex-2571@agentmail.to",
  ];
  try {
    const allMessages: any[] = [];
    await Promise.all(
      INBOXES.map(async (email) => {
        try {
          const r = await fetch(
            `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(email)}/threads?limit=10`,
            { headers: { Authorization: `Bearer ${AGENTMAIL_TOKEN}`, "Content-Type": "application/json" } },
          );
          if (!r.ok) return;
          const data = await r.json<any>();
          const threads = data?.threads || data?.items || data || [];
          if (Array.isArray(threads)) {
            threads.forEach((t: any) => {
              const latestMsg = t.latest_message || t.messages?.[0] || t;
              allMessages.push({
                id: t.id || latestMsg.id || `${email}-${Math.random()}`,
                inbox: email,
                from: latestMsg.from?.email || latestMsg.from || "unknown",
                subject: latestMsg.subject || t.subject || "(no subject)",
                date: latestMsg.date
                  ? new Date(latestMsg.date).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" })
                  : "",
                isRead: latestMsg.read !== false,
                snippet: latestMsg.text_body?.slice(0, 80) || latestMsg.snippet || "",
              });
            });
          }
        } catch {
          // skip failed inbox
        }
      }),
    );
    allMessages.sort((a, b) => (!a.date || !b.date ? 0 : b.date.localeCompare(a.date)));
    return c.json(allMessages);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get("/api/gmail/messages", (c) => c.json([]));

// ── AI Chat streaming (costs 2-4 credits) ──────────────────────────────
app.post("/api/chat/stream", async (c) => {
  const storage = c.get("storage");
  const { prompt, systemPrompt, model, clientId } = await c.req.json<{
    prompt: string; systemPrompt: string; model: string; agentId?: string; clientId?: number;
  }>();

  if (!prompt) return c.json({ error: "prompt is required" }, 400);

  const chatCosts: Record<string, number> = {
    "gpt-4o": 3, "claude-sonnet-4-5": 4, "gemini-2.0-flash": 2, "perplexity": 2,
  };
  const chatCreditError = await deductCredits(storage, clientId, chatCosts[model] || 3, `AI Chat: ${model}`);
  if (chatCreditError) return c.json({ error: chatCreditError }, 402);

  const modelMap: Record<string, { model: string }> = {
    "gpt-4o": { model: "gpt-4o" },
    "claude-sonnet-4-5": { model: "claude-sonnet-4-5" },
    "gemini-2.0-flash": { model: "gemini-2.0-flash" },
    "perplexity": { model: "sonar" },
  };
  const selected = modelMap[model] || modelMap["gpt-4o"];
  const openai = getOpenAI(c.env);

  return streamSSE(c, async (stream) => {
    try {
      const completion = await openai.chat.completions.create({
        model: selected.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        stream: true,
        max_tokens: 2000,
        temperature: 0.7,
      });
      for await (const chunk of completion) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) await stream.writeSSE({ data: JSON.stringify({ text }) });
      }
      await stream.writeSSE({ data: "[DONE]" });
    } catch (err: any) {
      await stream.writeSSE({ data: JSON.stringify({ text: `\n\n⚠️ Error: ${err.message}` }) });
    }
  });
});

// ── AI Credits API ─────────────────────────────────────────────────────
app.get("/api/clients", async (c) => {
  try {
    return c.json(await c.get("storage").getAllClients());
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post("/api/clients", async (c) => {
  try {
    const storage = c.get("storage");
    const { name, email, tier } = await c.req.json<{ name: string; email: string; tier: string }>();
    if (!name || !email || !tier) return c.json({ error: "name, email, tier required" }, 400);
    const allocation = TIER_ALLOCATIONS[tier] || 0;
    const client = await storage.createClient({
      name,
      email,
      tier,
      aiCredits: allocation,
      monthlyAllocation: allocation,
      createdAt: new Date().toISOString(),
    });
    if (allocation > 0) {
      await storage.addTransaction({
        clientId: client.id,
        amount: allocation,
        type: "monthly",
        description: `Initial ${tier} monthly allocation`,
        balanceAfter: allocation,
        paymentRef: null,
        createdAt: new Date().toISOString(),
      });
    }
    return c.json(client);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get("/api/clients/:id/credits", async (c) => {
  try {
    const storage = c.get("storage");
    const id = parseInt(c.req.param("id"));
    const client = await storage.getClientById(id);
    if (!client) return c.json({ error: "Client not found" }, 404);
    const transactions = await storage.getTransactions(id);
    return c.json({
      clientId: client.id,
      name: client.name,
      tier: client.tier,
      balance: client.aiCredits,
      monthlyAllocation: client.monthlyAllocation,
      transactions: transactions.slice(0, 50),
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post("/api/clients/:id/credits/purchase", async (c) => {
  try {
    const storage = c.get("storage");
    const id = parseInt(c.req.param("id"));
    const { amount, paymentRef, description } = await c.req.json<{
      amount: number; paymentRef?: string; description?: string;
    }>();
    if (!amount || amount <= 0) return c.json({ error: "amount must be positive" }, 400);
    const client = await storage.getClientById(id);
    if (!client) return c.json({ error: "Client not found" }, 404);
    const newBalance = client.aiCredits + amount;
    await storage.updateClientCredits(id, newBalance);
    const tx = await storage.addTransaction({
      clientId: id,
      amount,
      type: "purchase",
      description: description || `Purchased ${amount} credits`,
      balanceAfter: newBalance,
      paymentRef: paymentRef || null,
      createdAt: new Date().toISOString(),
    });
    return c.json({ balance: newBalance, transaction: tx });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post("/api/clients/:id/credits/deduct", async (c) => {
  try {
    const storage = c.get("storage");
    const id = parseInt(c.req.param("id"));
    const { amount, usageType, description } = await c.req.json<{
      amount: number; usageType?: string; description?: string;
    }>();
    if (!amount || amount <= 0) return c.json({ error: "amount must be positive" }, 400);
    const client = await storage.getClientById(id);
    if (!client) return c.json({ error: "Client not found" }, 404);
    if (client.aiCredits < amount) {
      return c.json({ error: "Insufficient credits", balance: client.aiCredits, required: amount }, 402);
    }
    const newBalance = client.aiCredits - amount;
    await storage.updateClientCredits(id, newBalance);
    const tx = await storage.addTransaction({
      clientId: id,
      amount: -amount,
      type: "usage",
      description: description || usageType || `AI usage: -${amount} credits`,
      balanceAfter: newBalance,
      paymentRef: null,
      createdAt: new Date().toISOString(),
    });
    return c.json({ balance: newBalance, transaction: tx });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get("/api/credits/costs", (c) => c.json(CREDIT_COSTS));

app.post("/api/webhooks/payfast", async (c) => {
  try {
    const storage = c.get("storage");
    // PayFast posts application/x-www-form-urlencoded
    const body = await c.req.parseBody();
    const payment_status = String(body.payment_status || "");
    const amount_gross = String(body.amount_gross || "");
    const pf_payment_id = String(body.pf_payment_id || "");
    const m_payment_id = String(body.m_payment_id || "");
    const custom_str1 = String(body.custom_str1 || ""); // client ID
    const custom_str2 = String(body.custom_str2 || ""); // credit amount

    if (payment_status !== "COMPLETE") return c.text("OK", 200);

    const clientId = parseInt(custom_str1);
    const creditAmount = parseInt(custom_str2) || Math.floor(parseFloat(amount_gross));
    if (!clientId || !creditAmount) return c.json({ error: "Missing client or credit info" }, 400);

    const client = await storage.getClientById(clientId);
    if (!client) return c.json({ error: "Client not found" }, 404);

    const newBalance = client.aiCredits + creditAmount;
    await storage.updateClientCredits(clientId, newBalance);
    await storage.addTransaction({
      clientId,
      amount: creditAmount,
      type: "purchase",
      description: `PayFast payment R${amount_gross} (ref: ${pf_payment_id})`,
      balanceAfter: newBalance,
      paymentRef: m_payment_id || pf_payment_id,
      createdAt: new Date().toISOString(),
    });
    return c.text("OK", 200);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ── Static assets + SPA fallback (non-/api routes) ─────────────────────
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
