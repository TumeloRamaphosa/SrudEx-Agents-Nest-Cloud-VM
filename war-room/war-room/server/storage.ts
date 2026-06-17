import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, or } from "drizzle-orm";
import { contentItems, calendarEvents, analyticsCache, cachedMessages, type ContentItem, type CalendarEvent, type InsertContentItem, type InsertCachedMessage } from "../shared/schema";

const sqlite = new Database("data.db");
export const db = drizzle(sqlite);

// Create tables
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

// Seed content items if empty
const existing = db.select().from(contentItems).all();
if (existing.length === 0) {
  const seed = [
    {
      title: "Tomahawk Hero — Father's Day",
      type: "image",
      assetPath: "/assets/tomahawk-hero.jpg",
      caption: "Dad doesn't want a tie. Dad wants a Tomahawk.\n\nThis Father's Day, give the gift that hits different. Our premium Wagyu Tomahawk — aged to perfection, seared to glory.\n\n👑 Shop now → studexmeat.com\n🚚 Same-day JHB delivery on orders before 12pm Saturday",
      hashtags: "#FathersDay #StudExMeat #Wagyu #Tomahawk #PremiumMeat #JohannesburgEats #BraaiSeason",
      platform: "both",
      status: "posted",
      campaign: "Fathers Day",
      scheduledDate: "2026-06-03",
      fbPostId: "108934711902801_978017658337352",
      igPostId: "18050932724593521",
      postedAt: "2026-06-03T11:11:00Z",
      rejectionNote: null,
    },
    {
      title: "Hwende 2x Champ Box Reveal",
      type: "image",
      assetPath: "/assets/hwende-box.png",
      caption: "Two Titles. One Fire. Feed Like a Champion. 🏆🏆\n\nIntroducing the Nicholas Hwende 2x Champion Box — curated for those who compete at the highest level.\n\nWagyu Burger Patties + Ribeye 8+ + Boerewors + Biltong. R1,799. Limited stock.\n\n👉 studexmeat.com",
      hashtags: "#NicholasHwende #TheSaint #BRAVECF #EFC #StudExMeat #ChampionFuel #Wagyu #MMA",
      platform: "both",
      status: "approved",
      campaign: "Hwende",
      scheduledDate: "2026-06-12",
      fbPostId: null,
      igPostId: null,
      postedAt: null,
      rejectionNote: null,
    },
    {
      title: "Father's Day Braai Lifestyle",
      type: "image",
      assetPath: "/assets/braai-lifestyle.png",
      caption: "Some moments you never forget. This Father's Day, make it one of them.\n\nPremium Wagyu. Delivered to your door. 🔥\n\nOrder at studexmeat.com",
      hashtags: "#FathersDay #Braai #Wagyu #StudExMeat #PremiumMeat #FamilyTime #JHB",
      platform: "both",
      status: "draft",
      campaign: "Fathers Day",
      scheduledDate: "2026-06-10",
      fbPostId: null,
      igPostId: null,
      postedAt: null,
      rejectionNote: null,
    },
    {
      title: "Youth Day — June 16",
      type: "image",
      assetPath: "/assets/youth-day.png",
      caption: "Feed the Nation. 🇿🇦\n\nThis Youth Day we celebrate the fire in every South African. Premium Wagyu for champions who build this country.\n\n16 June — studexmeat.com",
      hashtags: "#YouthDay #June16 #StudExMeat #FeedTheNation #SouthAfrica #Wagyu #Braai",
      platform: "both",
      status: "draft",
      campaign: "Youth Day",
      scheduledDate: "2026-06-16",
      fbPostId: null,
      igPostId: null,
      postedAt: null,
      rejectionNote: null,
    },
    {
      title: "Wagyu Burger Patties",
      type: "image",
      assetPath: "/assets/wagyu-patties.png",
      caption: "Not all burgers are created equal. 🍔\n\nOur Wagyu Burger Patties — premium marbled beef that turns any braai into a five-star experience.\n\n📦 Order at studexmeat.com",
      hashtags: "#WagyuBurger #StudExMeat #PremiumBeef #BraaiSeason #JHB #Wagyu #BurgerLovers",
      platform: "both",
      status: "draft",
      campaign: "Product Spotlight",
      scheduledDate: "2026-06-07",
      fbPostId: null,
      igPostId: null,
      postedAt: null,
      rejectionNote: null,
    },
    {
      title: "Hwende Celebration Reel",
      type: "image",
      assetPath: "/assets/hwende-celebration.png",
      caption: "TWO TITLES. ONE FIRE. 🏆🏆\n\nCongratulations to The Saint — Nicholas Hwende. 2x Champion. Africa's Fighting Pride.\n\nFeed like a champion. The Hwende 2x Champ Box drops June 12.\n\n👉 studexmeat.com",
      hashtags: "#NicholasHwende #TheSaint #2xChamp #BRAVECF #EFC #StudExMeat #Champion #MMA #Africa",
      platform: "instagram",
      status: "approved",
      campaign: "Hwende",
      scheduledDate: "2026-06-12",
      fbPostId: null,
      igPostId: null,
      postedAt: null,
      rejectionNote: null,
    },
    {
      title: "Ankole Ribeye — Only 7 Left",
      type: "image",
      assetPath: "/assets/ankole-scarcity.png",
      caption: "Only 7 left. 🔴\n\nOur Ankole Ribeye is almost gone. Hand-selected, grass-fed, rich with natural marbling that Wagyu dreams about.\n\nOnce it's gone — it's gone. Order now → studexmeat.com",
      hashtags: "#AnkoleRibeye #StudExMeat #LimitedStock #PremiumBeef #JHB #Wagyu #BraaiSeason #ScarcityAlert",
      platform: "both",
      status: "draft",
      campaign: "Product Spotlight",
      scheduledDate: "2026-06-04",
      fbPostId: null,
      igPostId: null,
      postedAt: null,
      rejectionNote: null,
    },
  ];
  for (const item of seed) {
    db.insert(contentItems).values(item).run();
  }
}

// Seed calendar if empty
const existingCal = db.select().from(calendarEvents).all();
if (existingCal.length === 0) {
  const calSeed = [
    { date: "2026-06-03", title: "Tomahawk Hero Posted ✅", description: "Father's Day campaign launch — Tomahawk hero image live on FB + IG", platform: "both", campaign: "Fathers Day", color: "#22c55e" },
    { date: "2026-06-04", title: "Ankole Scarcity Drop", description: "Only 7 Ankole Ribeye left — urgency post", platform: "both", campaign: "Product Spotlight", color: "#ef4444" },
    { date: "2026-06-05", title: "Father's Day Ad Live", description: "Paid ad goes live — R100/day, South Africa ages 25-55", platform: "facebook", campaign: "Fathers Day", color: "#3b82f6" },
    { date: "2026-06-07", title: "Wagyu Burger Patties", description: "Product spotlight — Saturday braai timing", platform: "both", campaign: "Product Spotlight", color: "#C9A84C" },
    { date: "2026-06-10", title: "Braai Lifestyle", description: "Emotional Father's Day storytelling — father + son braai", platform: "both", campaign: "Fathers Day", color: "#C9A84C" },
    { date: "2026-06-12", title: "Hwende Box Drop 🏆", description: "Nicholas Hwende 2x Champ Box reveal + celebration reel", platform: "both", campaign: "Hwende", color: "#8b5cf6" },
    { date: "2026-06-14", title: "Youth Day Teaser", description: "Patriotism angle — Youth Day June 16 preview", platform: "both", campaign: "Youth Day", color: "#10b981" },
    { date: "2026-06-15", title: "Father's Day Push 🎁", description: "Last-day push + WhatsApp broadcast — VIP box + Tomahawk", platform: "both", campaign: "Fathers Day", color: "#C9A84C" },
    { date: "2026-06-16", title: "Youth Day 🇿🇦", description: "Feed the Nation — Youth Day post", platform: "both", campaign: "Youth Day", color: "#10b981" },
    { date: "2026-06-19", title: "Hwende Fan Repost", description: "Fan testimonial or engagement repost", platform: "instagram", campaign: "Hwende", color: "#8b5cf6" },
    { date: "2026-06-22", title: "Hwende Restock Alert", description: "2x Champ Box restock notification", platform: "both", campaign: "Hwende", color: "#8b5cf6" },
    { date: "2026-06-26", title: "Campaign Wrap", description: "Hwende campaign wrap + thank you post", platform: "both", campaign: "Hwende", color: "#8b5cf6" },
  ];
  for (const e of calSeed) {
    db.insert(calendarEvents).values(e).run();
  }
}

export const storage = {
  // Content
  getAllContent: () => db.select().from(contentItems).all(),
  getContentById: (id: number) => db.select().from(contentItems).where(eq(contentItems.id, id)).get(),
  updateContentStatus: (id: number, status: string, note?: string) =>
    db.update(contentItems).set({ status, rejectionNote: note || null }).where(eq(contentItems.id, id)).run(),
  markPosted: (id: number, fbPostId: string | null, igPostId: string | null) =>
    db.update(contentItems).set({ status: "posted", fbPostId, igPostId, postedAt: new Date().toISOString() }).where(eq(contentItems.id, id)).run(),

  // Calendar
  getAllEvents: () => db.select().from(calendarEvents).all(),

  // Messages (Gmail + AgentMail)
  getMessages: (source?: string) => {
    if (source) {
      return db.select().from(cachedMessages).where(eq(cachedMessages.source, source)).all();
    }
    return db.select().from(cachedMessages).all();
  },
  upsertMessage: (msg: InsertCachedMessage) => {
    const existing = db.select().from(cachedMessages).where(eq(cachedMessages.messageId, msg.messageId)).get();
    if (existing) {
      db.update(cachedMessages).set(msg).where(eq(cachedMessages.messageId, msg.messageId)).run();
    } else {
      db.insert(cachedMessages).values(msg).run();
    }
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

  // Analytics cache
  getCache: (key: string) => db.select().from(analyticsCache).where(eq(analyticsCache.key, key)).get(),
  setCache: (key: string, value: string) => {
    const existing = db.select().from(analyticsCache).where(eq(analyticsCache.key, key)).get();
    if (existing) {
      db.update(analyticsCache).set({ value, updatedAt: new Date().toISOString() }).where(eq(analyticsCache.key, key)).run();
    } else {
      db.insert(analyticsCache).values({ key, value, updatedAt: new Date().toISOString() }).run();
    }
  },
};
