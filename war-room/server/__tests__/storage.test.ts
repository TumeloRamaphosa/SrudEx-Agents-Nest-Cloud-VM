import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import {
  contentItems,
  calendarEvents,
  analyticsCache,
  cachedMessages,
} from "../../shared/schema";
import type { InsertCachedMessage } from "../../shared/schema";

function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS content_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      asset_path TEXT NOT NULL,
      caption TEXT NOT NULL,
      hashtags TEXT NOT NULL,
      platform TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      campaign TEXT,
      scheduled_date TEXT,
      fb_post_id TEXT,
      ig_post_id TEXT,
      posted_at TEXT,
      rejection_note TEXT
    );
    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      platform TEXT NOT NULL,
      campaign TEXT,
      content_item_id INTEGER,
      color TEXT DEFAULT '#C9A84C'
    );
    CREATE TABLE IF NOT EXISTS analytics_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cached_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      message_id TEXT NOT NULL UNIQUE,
      inbox TEXT NOT NULL,
      from_addr TEXT NOT NULL,
      subject TEXT NOT NULL,
      snippet TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      labels TEXT NOT NULL DEFAULT '[]',
      synced_at TEXT NOT NULL
    );
  `);
  return { sqlite, db: drizzle(sqlite) };
}

function buildStorage(db: ReturnType<typeof drizzle>) {
  return {
    getAllContent: () => db.select().from(contentItems).all(),
    getContentById: (id: number) =>
      db.select().from(contentItems).where(eq(contentItems.id, id)).get(),
    updateContentStatus: (id: number, status: string, note?: string) =>
      db
        .update(contentItems)
        .set({ status, rejectionNote: note || null })
        .where(eq(contentItems.id, id))
        .run(),
    markPosted: (id: number, fbPostId: string | null, igPostId: string | null) =>
      db
        .update(contentItems)
        .set({
          status: "posted",
          fbPostId,
          igPostId,
          postedAt: new Date().toISOString(),
        })
        .where(eq(contentItems.id, id))
        .run(),
    getAllEvents: () => db.select().from(calendarEvents).all(),
    getMessages: (source?: string) => {
      if (source) {
        return db
          .select()
          .from(cachedMessages)
          .where(eq(cachedMessages.source, source))
          .all();
      }
      return db.select().from(cachedMessages).all();
    },
    upsertMessage: (msg: InsertCachedMessage) => {
      const existing = db
        .select()
        .from(cachedMessages)
        .where(eq(cachedMessages.messageId, msg.messageId))
        .get();
      if (existing) {
        db.update(cachedMessages)
          .set(msg)
          .where(eq(cachedMessages.messageId, msg.messageId))
          .run();
      } else {
        db.insert(cachedMessages).values(msg).run();
      }
    },
    upsertMessages: (msgs: InsertCachedMessage[]) => {
      for (const msg of msgs) {
        const existing = db
          .select()
          .from(cachedMessages)
          .where(eq(cachedMessages.messageId, msg.messageId))
          .get();
        if (existing) {
          db.update(cachedMessages)
            .set(msg)
            .where(eq(cachedMessages.messageId, msg.messageId))
            .run();
        } else {
          db.insert(cachedMessages).values(msg).run();
        }
      }
    },
    getCache: (key: string) =>
      db.select().from(analyticsCache).where(eq(analyticsCache.key, key)).get(),
    setCache: (key: string, value: string) => {
      const existing = db
        .select()
        .from(analyticsCache)
        .where(eq(analyticsCache.key, key))
        .get();
      if (existing) {
        db.update(analyticsCache)
          .set({ value, updatedAt: new Date().toISOString() })
          .where(eq(analyticsCache.key, key))
          .run();
      } else {
        db.insert(analyticsCache)
          .values({ key, value, updatedAt: new Date().toISOString() })
          .run();
      }
    },
  };
}

describe("Storage Layer", () => {
  let storage: ReturnType<typeof buildStorage>;

  beforeEach(() => {
    const { db } = createTestDb();
    storage = buildStorage(db);
  });

  describe("Content Items", () => {
    const sampleContent = {
      title: "Test Post",
      type: "image",
      assetPath: "/assets/test.jpg",
      caption: "Test caption",
      hashtags: "#test",
      platform: "both",
      status: "draft",
      campaign: "Test Campaign",
      scheduledDate: "2026-06-10",
    };

    it("returns empty array when no content exists", () => {
      expect(storage.getAllContent()).toEqual([]);
    });

    it("inserts and retrieves content items", () => {
      const { db } = createTestDb();
      storage = buildStorage(db);
      db.insert(contentItems).values(sampleContent).run();

      const all = storage.getAllContent();
      expect(all).toHaveLength(1);
      expect(all[0].title).toBe("Test Post");
      expect(all[0].status).toBe("draft");
      expect(all[0].platform).toBe("both");
    });

    it("retrieves content by id", () => {
      const { db } = createTestDb();
      storage = buildStorage(db);
      db.insert(contentItems).values(sampleContent).run();

      const item = storage.getContentById(1);
      expect(item).toBeDefined();
      expect(item!.title).toBe("Test Post");
    });

    it("returns undefined for non-existent id", () => {
      const item = storage.getContentById(999);
      expect(item).toBeUndefined();
    });

    it("updates content status", () => {
      const { db } = createTestDb();
      storage = buildStorage(db);
      db.insert(contentItems).values(sampleContent).run();

      storage.updateContentStatus(1, "approved");
      const item = storage.getContentById(1);
      expect(item!.status).toBe("approved");
      expect(item!.rejectionNote).toBeNull();
    });

    it("updates content status with rejection note", () => {
      const { db } = createTestDb();
      storage = buildStorage(db);
      db.insert(contentItems).values(sampleContent).run();

      storage.updateContentStatus(1, "rejected", "Needs better hashtags");
      const item = storage.getContentById(1);
      expect(item!.status).toBe("rejected");
      expect(item!.rejectionNote).toBe("Needs better hashtags");
    });

    it("clears rejection note when no note provided", () => {
      const { db } = createTestDb();
      storage = buildStorage(db);
      db.insert(contentItems).values({ ...sampleContent, rejectionNote: "old note" }).run();

      storage.updateContentStatus(1, "approved");
      const item = storage.getContentById(1);
      expect(item!.rejectionNote).toBeNull();
    });

    it("marks content as posted with platform post IDs", () => {
      const { db } = createTestDb();
      storage = buildStorage(db);
      db.insert(contentItems).values(sampleContent).run();

      storage.markPosted(1, "fb_123", "ig_456");
      const item = storage.getContentById(1);
      expect(item!.status).toBe("posted");
      expect(item!.fbPostId).toBe("fb_123");
      expect(item!.igPostId).toBe("ig_456");
      expect(item!.postedAt).toBeTruthy();
    });

    it("marks content as posted with null platform IDs", () => {
      const { db } = createTestDb();
      storage = buildStorage(db);
      db.insert(contentItems).values(sampleContent).run();

      storage.markPosted(1, null, null);
      const item = storage.getContentById(1);
      expect(item!.status).toBe("posted");
      expect(item!.fbPostId).toBeNull();
      expect(item!.igPostId).toBeNull();
    });
  });

  describe("Calendar Events", () => {
    it("returns empty array when no events exist", () => {
      expect(storage.getAllEvents()).toEqual([]);
    });

    it("retrieves inserted calendar events", () => {
      const { db } = createTestDb();
      storage = buildStorage(db);
      db.insert(calendarEvents)
        .values({
          date: "2026-06-16",
          title: "Youth Day",
          description: "Feed the Nation post",
          platform: "both",
          campaign: "Youth Day",
          color: "#10b981",
        })
        .run();

      const events = storage.getAllEvents();
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe("Youth Day");
      expect(events[0].date).toBe("2026-06-16");
    });
  });

  describe("Cached Messages", () => {
    const sampleMsg: InsertCachedMessage = {
      source: "gmail",
      messageId: "msg-001",
      inbox: "test@gmail.com",
      fromAddr: "sender@example.com",
      subject: "Test Subject",
      snippet: "Preview text",
      date: "2026-06-10T10:00:00Z",
      isRead: false,
      labels: "[]",
      syncedAt: "2026-06-10T10:00:00Z",
    };

    it("returns empty when no messages", () => {
      expect(storage.getMessages()).toEqual([]);
    });

    it("inserts a new message via upsertMessage", () => {
      storage.upsertMessage(sampleMsg);
      const msgs = storage.getMessages();
      expect(msgs).toHaveLength(1);
      expect(msgs[0].subject).toBe("Test Subject");
    });

    it("updates existing message via upsertMessage", () => {
      storage.upsertMessage(sampleMsg);
      storage.upsertMessage({ ...sampleMsg, subject: "Updated Subject" });
      const msgs = storage.getMessages();
      expect(msgs).toHaveLength(1);
      expect(msgs[0].subject).toBe("Updated Subject");
    });

    it("filters messages by source", () => {
      storage.upsertMessage(sampleMsg);
      storage.upsertMessage({ ...sampleMsg, messageId: "msg-002", source: "agentmail" });

      expect(storage.getMessages("gmail")).toHaveLength(1);
      expect(storage.getMessages("agentmail")).toHaveLength(1);
      expect(storage.getMessages()).toHaveLength(2);
    });

    it("bulk inserts via upsertMessages", () => {
      const msgs: InsertCachedMessage[] = [
        sampleMsg,
        { ...sampleMsg, messageId: "msg-002", subject: "Second" },
        { ...sampleMsg, messageId: "msg-003", subject: "Third" },
      ];
      storage.upsertMessages(msgs);
      expect(storage.getMessages()).toHaveLength(3);
    });

    it("bulk upsert updates existing and inserts new", () => {
      storage.upsertMessage(sampleMsg);
      storage.upsertMessages([
        { ...sampleMsg, subject: "Updated" },
        { ...sampleMsg, messageId: "msg-new", subject: "New" },
      ]);
      const msgs = storage.getMessages();
      expect(msgs).toHaveLength(2);
      const updated = msgs.find((m) => m.messageId === "msg-001");
      expect(updated!.subject).toBe("Updated");
    });
  });

  describe("Analytics Cache", () => {
    it("returns undefined for non-existent key", () => {
      expect(storage.getCache("missing")).toBeUndefined();
    });

    it("sets and retrieves a cache entry", () => {
      storage.setCache("shopify_revenue", "43585");
      const entry = storage.getCache("shopify_revenue");
      expect(entry).toBeDefined();
      expect(entry!.value).toBe("43585");
      expect(entry!.updatedAt).toBeTruthy();
    });

    it("updates existing cache entry", () => {
      storage.setCache("shopify_revenue", "43585");
      storage.setCache("shopify_revenue", "50000");
      const entry = storage.getCache("shopify_revenue");
      expect(entry!.value).toBe("50000");
    });

    it("stores multiple independent keys", () => {
      storage.setCache("key_a", "value_a");
      storage.setCache("key_b", "value_b");
      expect(storage.getCache("key_a")!.value).toBe("value_a");
      expect(storage.getCache("key_b")!.value).toBe("value_b");
    });
  });
});
