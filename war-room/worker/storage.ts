import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import {
  contentItems,
  calendarEvents,
  analyticsCache,
  cachedMessages,
  clients,
  creditTransactions,
} from "../shared/schema";

// Native Drizzle insert types (avoid drizzle-zod inference in the Worker build).
type InsertCachedMessage = typeof cachedMessages.$inferInsert;
type InsertClient = typeof clients.$inferInsert;
type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

/**
 * Cloudflare D1-backed storage layer for the War Room.
 * Mirrors server/storage.ts (better-sqlite3) but async — D1 returns promises.
 */
export function createStorage(d1: D1Database) {
  const db: DrizzleD1Database = drizzle(d1);

  return {
    // ── Content ──────────────────────────────────────────────────────
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
        .set({ status: "posted", fbPostId, igPostId, postedAt: new Date().toISOString() })
        .where(eq(contentItems.id, id))
        .run(),

    // ── Calendar ─────────────────────────────────────────────────────
    getAllEvents: () => db.select().from(calendarEvents).all(),

    // ── Messages (Gmail + AgentMail) ─────────────────────────────────
    getMessages: (source?: string) =>
      source
        ? db.select().from(cachedMessages).where(eq(cachedMessages.source, source)).all()
        : db.select().from(cachedMessages).all(),
    upsertMessages: async (msgs: InsertCachedMessage[]) => {
      for (const msg of msgs) {
        const existing = await db
          .select()
          .from(cachedMessages)
          .where(eq(cachedMessages.messageId, msg.messageId))
          .get();
        if (existing) {
          await db
            .update(cachedMessages)
            .set(msg)
            .where(eq(cachedMessages.messageId, msg.messageId))
            .run();
        } else {
          await db.insert(cachedMessages).values(msg).run();
        }
      }
    },

    // ── Analytics cache ──────────────────────────────────────────────
    getCache: (key: string) =>
      db.select().from(analyticsCache).where(eq(analyticsCache.key, key)).get(),
    setCache: async (key: string, value: string) => {
      const existing = await db
        .select()
        .from(analyticsCache)
        .where(eq(analyticsCache.key, key))
        .get();
      if (existing) {
        await db
          .update(analyticsCache)
          .set({ value, updatedAt: new Date().toISOString() })
          .where(eq(analyticsCache.key, key))
          .run();
      } else {
        await db
          .insert(analyticsCache)
          .values({ key, value, updatedAt: new Date().toISOString() })
          .run();
      }
    },

    // ── AI Credits ───────────────────────────────────────────────────
    getClientById: (id: number) =>
      db.select().from(clients).where(eq(clients.id, id)).get(),
    getClientByEmail: (email: string) =>
      db.select().from(clients).where(eq(clients.email, email)).get(),
    getAllClients: () => db.select().from(clients).all(),
    createClient: (client: InsertClient) =>
      db.insert(clients).values(client).returning().get(),
    updateClientCredits: (id: number, credits: number) =>
      db.update(clients).set({ aiCredits: credits }).where(eq(clients.id, id)).run(),

    getTransactions: (clientId: number) =>
      db
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.clientId, clientId))
        .orderBy(desc(creditTransactions.id))
        .all(),
    addTransaction: (tx: InsertCreditTransaction) =>
      db.insert(creditTransactions).values(tx).returning().get(),
  };
}

export type Storage = ReturnType<typeof createStorage>;
