import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contentItems = sqliteTable("content_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  type: text("type").notNull(), // image | video
  assetPath: text("asset_path").notNull(),
  caption: text("caption").notNull(),
  hashtags: text("hashtags").notNull(),
  platform: text("platform").notNull(), // facebook | instagram | both
  status: text("status").notNull().default("draft"), // draft | approved | rejected | posted
  campaign: text("campaign"),
  scheduledDate: text("scheduled_date"),
  fbPostId: text("fb_post_id"),
  igPostId: text("ig_post_id"),
  postedAt: text("posted_at"),
  rejectionNote: text("rejection_note"),
});

export const calendarEvents = sqliteTable("calendar_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  platform: text("platform").notNull(),
  campaign: text("campaign"),
  contentItemId: integer("content_item_id"),
  color: text("color").default("#C9A84C"),
});

export const analyticsCache = sqliteTable("analytics_cache", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Cached messages from Gmail and AgentMail — synced by Perplexity Computer
export const cachedMessages = sqliteTable("cached_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(), // "gmail" | "agentmail"
  messageId: text("message_id").notNull().unique(),
  inbox: text("inbox").notNull(), // e.g. "tumelor001@gmail.com" or "studexgroup@agentmail.to"
  fromAddr: text("from_addr").notNull(),
  subject: text("subject").notNull(),
  snippet: text("snippet").notNull().default(""),
  date: text("date").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  labels: text("labels").notNull().default("[]"), // JSON array
  syncedAt: text("synced_at").notNull(),
});

export const insertContentItemSchema = createInsertSchema(contentItems).omit({ id: true });
export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true });
export const insertCachedMessageSchema = createInsertSchema(cachedMessages).omit({ id: true });

export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = z.infer<typeof insertContentItemSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type CachedMessage = typeof cachedMessages.$inferSelect;
export type InsertCachedMessage = z.infer<typeof insertCachedMessageSchema>;
