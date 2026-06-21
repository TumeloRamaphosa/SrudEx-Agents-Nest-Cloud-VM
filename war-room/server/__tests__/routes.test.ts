import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import express from "express";
import { createServer } from "node:http";
import request from "supertest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import {
  contentItems,
  calendarEvents,
  cachedMessages,
  analyticsCache,
} from "../../shared/schema";
import type { InsertCachedMessage } from "../../shared/schema";

function createTestStorage() {
  const sqlite = new Database(":memory:");
  sqlite.exec(`
    CREATE TABLE content_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, type TEXT NOT NULL, asset_path TEXT NOT NULL,
      caption TEXT NOT NULL, hashtags TEXT NOT NULL, platform TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft', campaign TEXT, scheduled_date TEXT,
      fb_post_id TEXT, ig_post_id TEXT, posted_at TEXT, rejection_note TEXT
    );
    CREATE TABLE calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL,
      platform TEXT NOT NULL, campaign TEXT, content_item_id INTEGER,
      color TEXT DEFAULT '#C9A84C'
    );
    CREATE TABLE analytics_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE, value TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE cached_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL, message_id TEXT NOT NULL UNIQUE,
      inbox TEXT NOT NULL, from_addr TEXT NOT NULL, subject TEXT NOT NULL,
      snippet TEXT NOT NULL DEFAULT '', date TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0, labels TEXT NOT NULL DEFAULT '[]',
      synced_at TEXT NOT NULL
    );
  `);
  const db = drizzle(sqlite);
  return {
    db,
    sqlite,
    storage: {
      getAllContent: () => db.select().from(contentItems).all(),
      getContentById: (id: number) =>
        db.select().from(contentItems).where(eq(contentItems.id, id)).get(),
      updateContentStatus: (id: number, status: string, note?: string) =>
        db.update(contentItems).set({ status, rejectionNote: note || null }).where(eq(contentItems.id, id)).run(),
      markPosted: (id: number, fbPostId: string | null, igPostId: string | null) =>
        db.update(contentItems).set({ status: "posted", fbPostId, igPostId, postedAt: new Date().toISOString() }).where(eq(contentItems.id, id)).run(),
      getAllEvents: () => db.select().from(calendarEvents).all(),
      getMessages: (source?: string) => {
        if (source) return db.select().from(cachedMessages).where(eq(cachedMessages.source, source)).all();
        return db.select().from(cachedMessages).all();
      },
      upsertMessages: (msgs: InsertCachedMessage[]) => {
        for (const msg of msgs) {
          const existing = db.select().from(cachedMessages).where(eq(cachedMessages.messageId, msg.messageId)).get();
          if (existing) {
            db.update(cachedMessages).set(msg).where(eq(cachedMessages.messageId, msg.messageId)).run();
          } else {
            db.insert(cachedMessages).values(msg).run();
          }
        }
      },
    },
  };
}

function createTestApp(storage: ReturnType<typeof createTestStorage>["storage"]) {
  const app = express();
  app.use(express.json());

  app.get("/api/content", (_req, res) => {
    try {
      res.json(storage.getAllContent());
    } catch {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.patch("/api/content/:id/status", (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, note } = req.body as { status: string; note?: string };
      if (!status) return res.status(400).json({ error: "status is required" });
      storage.updateContentStatus(id, status, note);
      const updated = storage.getContentById(id);
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  app.post("/api/content/:id/post", (req, res) => {
    try {
      const id = parseInt(req.params.id);
      storage.markPosted(id, null, null);
      const updated = storage.getContentById(id);
      res.json({ success: true, message: "Queued for posting", item: updated });
    } catch {
      res.status(500).json({ error: "Failed to post content" });
    }
  });

  app.get("/api/calendar", (_req, res) => {
    try {
      res.json(storage.getAllEvents());
    } catch {
      res.status(500).json({ error: "Failed to fetch calendar" });
    }
  });

  app.get("/api/analytics/shopify", (_req, res) => {
    res.json({ revenue: 43585, orders: 4, topProduct: "Wagyu Burger Patties" });
  });

  app.get("/api/shopify/unfulfilled", (_req, res) => {
    res.json({
      count: 37,
      total: 125561.15,
      oldest: "#1221 Apr 2024",
      orders: [
        { order: "#1221", initials: "R.G.", amount: 29325, daysWaiting: 420 },
      ],
    });
  });

  app.get("/api/shopify/today", (_req, res) => {
    res.json({ orders: 4, revenue: 43585, topOrder: "R29,325 Radik G." });
  });

  app.patch("/api/content/:id/caption", (_req, res) => {
    res.json({ success: true, message: "Caption noted" });
  });

  app.get("/api/facebook/ads", (_req, res) => {
    res.json({
      account: { id: "act_560666565541381", name: "StudEx Meat", currency: "ZAR", balance: 0, daily_limit: 3571 },
      campaigns: [],
      adsets: [],
      ads: [],
      billing: { method: "MasterCard *8234", status: "Valid", balance: "R0", daily_limit: "R3,571" },
    });
  });

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

  app.get("/api/messages", (req, res) => {
    try {
      const source = req.query.source as string | undefined;
      res.json(storage.getMessages(source));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gmail/messages", (_req, res) => {
    res.json([]);
  });

  return app;
}

describe("War Room API Routes", () => {
  let app: express.Express;
  let testStorage: ReturnType<typeof createTestStorage>;

  beforeEach(() => {
    testStorage = createTestStorage();
    app = createTestApp(testStorage.storage);
  });

  describe("GET /api/content", () => {
    it("returns empty array when no content", async () => {
      const res = await request(app).get("/api/content");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("returns seeded content items", async () => {
      testStorage.db.insert(contentItems).values({
        title: "Test", type: "image", assetPath: "/test.jpg",
        caption: "cap", hashtags: "#t", platform: "both", status: "draft",
      }).run();

      const res = await request(app).get("/api/content");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe("Test");
    });
  });

  describe("PATCH /api/content/:id/status", () => {
    beforeEach(() => {
      testStorage.db.insert(contentItems).values({
        title: "Draft Post", type: "image", assetPath: "/test.jpg",
        caption: "cap", hashtags: "#t", platform: "both", status: "draft",
      }).run();
    });

    it("approves a content item", async () => {
      const res = await request(app)
        .patch("/api/content/1/status")
        .send({ status: "approved" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("approved");
    });

    it("rejects with a note", async () => {
      const res = await request(app)
        .patch("/api/content/1/status")
        .send({ status: "rejected", note: "Bad hashtags" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("rejected");
      expect(res.body.rejectionNote).toBe("Bad hashtags");
    });

    it("returns 400 when status is missing", async () => {
      const res = await request(app)
        .patch("/api/content/1/status")
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("status is required");
    });
  });

  describe("POST /api/content/:id/post", () => {
    beforeEach(() => {
      testStorage.db.insert(contentItems).values({
        title: "Ready Post", type: "image", assetPath: "/test.jpg",
        caption: "cap", hashtags: "#t", platform: "both", status: "approved",
      }).run();
    });

    it("marks content as posted", async () => {
      const res = await request(app).post("/api/content/1/post");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.item.status).toBe("posted");
    });
  });

  describe("GET /api/calendar", () => {
    it("returns empty calendar", async () => {
      const res = await request(app).get("/api/calendar");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("returns seeded events", async () => {
      testStorage.db.insert(calendarEvents).values({
        date: "2026-06-16", title: "Youth Day", description: "Post",
        platform: "both", campaign: "Youth Day",
      }).run();

      const res = await request(app).get("/api/calendar");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe("GET /api/analytics/shopify", () => {
    it("returns mock Shopify analytics", async () => {
      const res = await request(app).get("/api/analytics/shopify");
      expect(res.status).toBe(200);
      expect(res.body.revenue).toBe(43585);
      expect(res.body.orders).toBe(4);
      expect(res.body.topProduct).toBe("Wagyu Burger Patties");
    });
  });

  describe("GET /api/shopify/unfulfilled", () => {
    it("returns mock unfulfilled orders", async () => {
      const res = await request(app).get("/api/shopify/unfulfilled");
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(37);
      expect(res.body.total).toBe(125561.15);
      expect(res.body.orders).toBeInstanceOf(Array);
    });
  });

  describe("GET /api/shopify/today", () => {
    it("returns mock today stats", async () => {
      const res = await request(app).get("/api/shopify/today");
      expect(res.status).toBe(200);
      expect(res.body.orders).toBe(4);
      expect(res.body.revenue).toBe(43585);
    });
  });

  describe("PATCH /api/content/:id/caption", () => {
    it("acknowledges caption update", async () => {
      const res = await request(app)
        .patch("/api/content/1/caption")
        .send({ caption: "new caption" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/facebook/ads", () => {
    it("returns mock Facebook ads data", async () => {
      const res = await request(app).get("/api/facebook/ads");
      expect(res.status).toBe(200);
      expect(res.body.account.name).toBe("StudEx Meat");
      expect(res.body.billing.status).toBe("Valid");
    });
  });

  describe("POST /api/messages/sync", () => {
    it("syncs messages and returns count", async () => {
      const res = await request(app)
        .post("/api/messages/sync")
        .send({
          messages: [
            { source: "gmail", messageId: "gm1", inbox: "test@gmail.com", from: "a@b.com", subject: "Hi" },
            { source: "agentmail", messageId: "am1", inbox: "team@agentmail.to", from: "c@d.com", subject: "Hey" },
          ],
        });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.synced).toBe(2);
    });

    it("returns 400 for non-array messages", async () => {
      const res = await request(app)
        .post("/api/messages/sync")
        .send({ messages: "not-an-array" });
      expect(res.status).toBe(400);
    });

    it("defaults missing fields", async () => {
      const res = await request(app)
        .post("/api/messages/sync")
        .send({ messages: [{ source: "gmail" }] });
      expect(res.status).toBe(200);

      const msgs = await request(app).get("/api/messages");
      expect(msgs.body[0].subject).toBe("(no subject)");
    });
  });

  describe("GET /api/messages", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/messages/sync")
        .send({
          messages: [
            { source: "gmail", messageId: "gm1", subject: "Gmail msg" },
            { source: "agentmail", messageId: "am1", subject: "AgentMail msg" },
          ],
        });
    });

    it("returns all messages", async () => {
      const res = await request(app).get("/api/messages");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it("filters by source", async () => {
      const res = await request(app).get("/api/messages?source=gmail");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].source).toBe("gmail");
    });
  });

  describe("GET /api/gmail/messages", () => {
    it("returns empty array (stub)", async () => {
      const res = await request(app).get("/api/gmail/messages");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });
});
