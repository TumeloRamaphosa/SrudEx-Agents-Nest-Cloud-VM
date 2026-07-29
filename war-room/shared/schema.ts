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

// Dark Factory — client projects
export const factoryProjects = sqliteTable("factory_projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  serviceId: text("service_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("intake"), // intake | scope | approved | sandbox-created | building | review-ready | delivered
  tier: text("tier").notNull().default("custom"), // quick-fix | micro-build | mini-project | mvp-build | custom
  quotedPriceUsd: real("quoted_price_usd"),
  depositPaid: integer("deposit_paid", { mode: "boolean" }).notNull().default(false),
  buildPaid: integer("build_paid", { mode: "boolean" }).notNull().default(false),
  finalPaid: integer("final_paid", { mode: "boolean" }).notNull().default(false),
  voiceNoteUrl: text("voice_note_url"),
  transcription: text("transcription"),
  attachments: text("attachments").notNull().default("[]"), // JSON array of file URLs
  links: text("links").notNull().default("[]"), // JSON array of submitted links
  linearIssueId: text("linear_issue_id"),
  githubRepo: text("github_repo"),
  reviewRound: integer("review_round").notNull().default(0),
  maxReviews: integer("max_reviews").notNull().default(3),
  agentNotes: text("agent_notes").notNull().default("[]"), // JSON array of agent activity
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Dark Factory — service catalog
export const factoryServices = sqliteTable("factory_services", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tier: text("tier").notNull(), // quick-fix | micro-build | mini-project | mvp-build | custom
  startingPriceUsd: real("starting_price_usd"),
  turnaround: text("turnaround").notNull(),
  features: text("features").notNull().default("[]"), // JSON array
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const insertContentItemSchema = createInsertSchema(contentItems).omit({ id: true });
export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true });
export const insertCachedMessageSchema = createInsertSchema(cachedMessages).omit({ id: true });
export const insertFactoryProjectSchema = createInsertSchema(factoryProjects).omit({ id: true });
export const insertFactoryServiceSchema = createInsertSchema(factoryServices);

export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = z.infer<typeof insertContentItemSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type CachedMessage = typeof cachedMessages.$inferSelect;
export type InsertCachedMessage = z.infer<typeof insertCachedMessageSchema>;
export type FactoryProject = typeof factoryProjects.$inferSelect;
export type InsertFactoryProject = z.infer<typeof insertFactoryProjectSchema>;
export type FactoryService = typeof factoryServices.$inferSelect;
export type InsertFactoryService = z.infer<typeof insertFactoryServiceSchema>;
