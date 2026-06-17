import type { Express } from "express";
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { storage } from "./storage";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "no-key" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // GET all content items
  app.get("/api/content", (_req, res) => {
    try {
      const items = storage.getAllContent();
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // PATCH content status (approve / reject)
  app.patch("/api/content/:id/status", (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, note } = req.body as { status: string; note?: string };
      if (!status) return res.status(400).json({ error: "status is required" });
      storage.updateContentStatus(id, status, note);
      const updated = storage.getContentById(id);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // POST post now (stub)
  app.post("/api/content/:id/post", (req, res) => {
    try {
      const id = parseInt(req.params.id);
      storage.markPosted(id, null, null);
      const updated = storage.getContentById(id);
      res.json({ success: true, message: "Queued for posting", item: updated });
    } catch (err) {
      res.status(500).json({ error: "Failed to post content" });
    }
  });

  // GET calendar events
  app.get("/api/calendar", (_req, res) => {
    try {
      const events = storage.getAllEvents();
      res.json(events);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch calendar" });
    }
  });

  // GET analytics shopify stub
  app.get("/api/analytics/shopify", (_req, res) => {
    res.json({
      revenue: 43585,
      orders: 4,
      topProduct: "Wagyu Burger Patties",
    });
  });

  // GET shopify unfulfilled orders (mock data)
  app.get("/api/shopify/unfulfilled", (_req, res) => {
    res.json({
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
    });
  });

  // GET shopify today stats (mock data)
  app.get("/api/shopify/today", (_req, res) => {
    res.json({
      orders: 4,
      revenue: 43585,
      topOrder: "R29,325 Radik G.",
    });
  });

  // POST generate caption
  app.post("/api/generate/caption", async (req, res) => {
    try {
      const { title, caption, campaign, tone } = req.body as {
        title: string;
        caption?: string;
        campaign?: string;
        tone: string;
      };

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

      const openai = getOpenAI();
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        stream: true,
        max_tokens: 400,
      });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to generate caption" });
    }
  });

  // PATCH update caption for a content item (stub — caption editing stored client-side)
  app.patch("/api/content/:id/caption", (req, res) => {
    res.json({ success: true, message: "Caption noted" });
  });

  // GET Facebook Ads mock data
  const MOCK_FB_ADS = {
    account: {
      id: "act_560666565541381",
      name: "StudEx Meat",
      currency: "ZAR",
      balance: 0,
      daily_limit: 3571,
    },
    campaigns: [
      {
        id: "120245475014320003",
        name: "Father's Day Tomahawk",
        status: "ACTIVE",
        objective: "OUTCOME_SALES",
        spend: 0,
        impressions: 0,
        clicks: 0,
        reach: 0,
      },
    ],
    adsets: [
      {
        id: "120245048870003",
        name: "SA Ages 25–55",
        status: "ACTIVE",
        daily_budget: 10000,
        targeting: "South Africa · Ages 25–55 · All genders",
        impressions: 0,
        clicks: 0,
        ctr: 0,
      },
    ],
    ads: [
      {
        id: "120245514004840003",
        name: "Father's Day Tomahawk Ad",
        status: "ACTIVE",
        creative_type: "Image",
        impressions: 0,
        clicks: 0,
        spend: 0,
      },
    ],
    billing: {
      method: "MasterCard *8234",
      status: "Valid",
      balance: "R0",
      daily_limit: "R3,571",
    },
  };

  app.get("/api/facebook/ads", (_req, res) => {
    res.json(MOCK_FB_ADS);
  });


  // ── Higgsfield Generation Route ──
  // ── Higgsfield Generation Route ──
  app.post("/api/higgsfield/generate", async (req, res) => {
    const { prompt, aspect = "1024x1024", mode = "image" } = req.body;

    const keyId = process.env.HIGGSFIELD_KEY_ID;
    const keySecret = process.env.HIGGSFIELD_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.json({ error: "HIGGSFIELD_KEY_MISSING" });
    }

    const headers = {
      "hf-api-key": keyId,
      "hf-secret": keySecret,
      "Content-Type": "application/json",
    };

    const [width, height] = aspect.split("x").map(Number);

    try {
      // Step 1: Submit image generation (Soul model)
      const submitRes = await fetch("https://platform.higgsfield.ai/v1/text2image/soul", {
        method: "POST",
        headers,
        body: JSON.stringify({
          params: {
            prompt,
            width_and_height: `${width}x${height}`,
            enhance_prompt: true,
            quality: "720p",
            batch_size: 1,
          },
        }),
      });

      if (!submitRes.ok) {
        const err = await submitRes.text();
        return res.status(500).json({ error: `Higgsfield submit failed: ${err}` });
      }

      const submitData = await submitRes.json();
      const jobId = submitData?.jobs?.[0]?.id || submitData?.id;

      if (!jobId) {
        return res.status(500).json({ error: "No job ID returned from Higgsfield" });
      }

      // Step 2: Poll for result (max 90s)
      const pollUrl = `https://platform.higgsfield.ai/v1/jobs/${jobId}`;
      let imageUrl: string | null = null;

      for (let i = 0; i < 45; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(pollUrl, { headers });
        const pollData = await pollRes.json();

        if (pollData.status === "completed") {
          imageUrl = pollData?.results?.raw?.url || pollData?.jobs?.[0]?.results?.raw?.url;
          break;
        }
        if (pollData.status === "failed") {
          return res.status(500).json({ error: "Higgsfield generation failed" });
        }
      }

      if (!imageUrl) {
        return res.status(500).json({ error: "Higgsfield timed out after 90s" });
      }

      // If video mode: submit image-to-video (DoP turbo)
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

        if (!vidRes.ok) {
          // Return image as fallback if video fails
          return res.json({ url: imageUrl, type: "image" });
        }

        const vidData = await vidRes.json();
        const vidJobId = vidData?.jobs?.[0]?.id || vidData?.id;

        if (!vidJobId) return res.json({ url: imageUrl, type: "image" });

        const vidPollUrl = `https://platform.higgsfield.ai/v1/jobs/${vidJobId}`;
        let videoUrl: string | null = null;

        for (let i = 0; i < 60; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          const vp = await fetch(vidPollUrl, { headers });
          const vpData = await vp.json();
          if (vpData.status === "completed") {
            videoUrl = vpData?.results?.raw?.url;
            break;
          }
          if (vpData.status === "failed") break;
        }

        return res.json({ url: videoUrl || imageUrl, type: videoUrl ? "video" : "image" });
      }

      return res.json({ url: imageUrl, type: "image" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/messages/sync — Perplexity Computer pushes Gmail + AgentMail here ──
  app.post("/api/messages/sync", (req, res) => {
    try {
      const { messages } = req.body as { messages: any[] };
      if (!Array.isArray(messages)) return res.status(400).json({ error: "messages must be an array" });
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
      storage.upsertMessages(normalised);
      res.json({ ok: true, synced: normalised.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/messages — serve cached messages to the dashboard ──
  app.get("/api/messages", (req, res) => {
    try {
      const source = req.query.source as string | undefined;
      const msgs = storage.getMessages(source);
      res.json(msgs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── AgentMail Proxy — fetch messages from all 3 real inboxes ──
  app.get("/api/agentmail/messages", async (_req, res) => {
    const AGENTMAIL_TOKEN = process.env.AGENTMAIL_TOKEN;
    if (!AGENTMAIL_TOKEN) return res.status(503).json({ error: "AGENTMAIL_TOKEN not configured" });
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
              {
                headers: {
                  Authorization: `Bearer ${AGENTMAIL_TOKEN}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (!r.ok) return;
            const data = await r.json();
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
        })
      );

      // Sort by date desc (newest first)
      allMessages.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return b.date.localeCompare(a.date);
      });

      res.json(allMessages);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Gmail stub endpoint (returns empty — Gmail OAuth required for live data) ──
  app.get("/api/gmail/messages", (_req, res) => {
    // Returns empty array — placeholder for Gmail OAuth integration
    // When Gmail connector is wired up, this route will forward to Google Gmail API
    res.json([]);
  });

  return httpServer;
}