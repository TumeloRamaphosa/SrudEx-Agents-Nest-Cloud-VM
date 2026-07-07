-- StudEx War Room — Cloudflare D1 schema
-- Mirrors war-room/shared/schema.ts (Drizzle sqlite-core tables).

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
  color TEXT DEFAULT '#a68a2e'
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

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL,
  ai_credits INTEGER NOT NULL DEFAULT 0,
  monthly_allocation INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  balance_after INTEGER NOT NULL,
  payment_ref TEXT,
  created_at TEXT NOT NULL
);

-- ── Seed data (dashboard demo content) ──
-- content_items seed
INSERT INTO content_items (title, type, asset_path, caption, hashtags, platform, status, campaign, scheduled_date, fb_post_id, ig_post_id, posted_at, rejection_note) VALUES ('Tomahawk Hero — Father''s Day', 'image', '/assets/tomahawk-hero.jpg', 'Dad doesn''t want a tie. Dad wants a Tomahawk.

This Father''s Day, give the gift that hits different. Our premium Wagyu Tomahawk — aged to perfection, seared to glory.

👑 Shop now → studexmeat.com
🚚 Same-day JHB delivery on orders before 12pm Saturday', '#FathersDay #StudExMeat #Wagyu #Tomahawk #PremiumMeat #JohannesburgEats #BraaiSeason', 'both', 'posted', 'Fathers Day', '2026-06-03', '108934711902801_978017658337352', '18050932724593521', '2026-06-03T11:11:00Z', NULL);
INSERT INTO content_items (title, type, asset_path, caption, hashtags, platform, status, campaign, scheduled_date, fb_post_id, ig_post_id, posted_at, rejection_note) VALUES ('Hwende 2x Champ Box Reveal', 'image', '/assets/hwende-box.png', 'Two Titles. One Fire. Feed Like a Champion. 🏆🏆

Introducing the Nicholas Hwende 2x Champion Box — curated for those who compete at the highest level.

Wagyu Burger Patties + Ribeye 8+ + Boerewors + Biltong. R1,799. Limited stock.

👉 studexmeat.com', '#NicholasHwende #TheSaint #BRAVECF #EFC #StudExMeat #ChampionFuel #Wagyu #MMA', 'both', 'approved', 'Hwende', '2026-06-12', NULL, NULL, NULL, NULL);
INSERT INTO content_items (title, type, asset_path, caption, hashtags, platform, status, campaign, scheduled_date, fb_post_id, ig_post_id, posted_at, rejection_note) VALUES ('Father''s Day Braai Lifestyle', 'image', '/assets/braai-lifestyle.png', 'Some moments you never forget. This Father''s Day, make it one of them.

Premium Wagyu. Delivered to your door. 🔥

Order at studexmeat.com', '#FathersDay #Braai #Wagyu #StudExMeat #PremiumMeat #FamilyTime #JHB', 'both', 'draft', 'Fathers Day', '2026-06-10', NULL, NULL, NULL, NULL);
INSERT INTO content_items (title, type, asset_path, caption, hashtags, platform, status, campaign, scheduled_date, fb_post_id, ig_post_id, posted_at, rejection_note) VALUES ('Youth Day — June 16', 'image', '/assets/youth-day.png', 'Feed the Nation. 🇿🇦

This Youth Day we celebrate the fire in every South African. Premium Wagyu for champions who build this country.

16 June — studexmeat.com', '#YouthDay #June16 #StudExMeat #FeedTheNation #SouthAfrica #Wagyu #Braai', 'both', 'draft', 'Youth Day', '2026-06-16', NULL, NULL, NULL, NULL);
INSERT INTO content_items (title, type, asset_path, caption, hashtags, platform, status, campaign, scheduled_date, fb_post_id, ig_post_id, posted_at, rejection_note) VALUES ('Wagyu Burger Patties', 'image', '/assets/wagyu-patties.png', 'Not all burgers are created equal. 🍔

Our Wagyu Burger Patties — premium marbled beef that turns any braai into a five-star experience.

📦 Order at studexmeat.com', '#WagyuBurger #StudExMeat #PremiumBeef #BraaiSeason #JHB #Wagyu #BurgerLovers', 'both', 'draft', 'Product Spotlight', '2026-06-07', NULL, NULL, NULL, NULL);
INSERT INTO content_items (title, type, asset_path, caption, hashtags, platform, status, campaign, scheduled_date, fb_post_id, ig_post_id, posted_at, rejection_note) VALUES ('Hwende Celebration Reel', 'image', '/assets/hwende-celebration.png', 'TWO TITLES. ONE FIRE. 🏆🏆

Congratulations to The Saint — Nicholas Hwende. 2x Champion. Africa''s Fighting Pride.

Feed like a champion. The Hwende 2x Champ Box drops June 12.

👉 studexmeat.com', '#NicholasHwende #TheSaint #2xChamp #BRAVECF #EFC #StudExMeat #Champion #MMA #Africa', 'instagram', 'approved', 'Hwende', '2026-06-12', NULL, NULL, NULL, NULL);
INSERT INTO content_items (title, type, asset_path, caption, hashtags, platform, status, campaign, scheduled_date, fb_post_id, ig_post_id, posted_at, rejection_note) VALUES ('Ankole Ribeye — Only 7 Left', 'image', '/assets/ankole-scarcity.png', 'Only 7 left. 🔴

Our Ankole Ribeye is almost gone. Hand-selected, grass-fed, rich with natural marbling that Wagyu dreams about.

Once it''s gone — it''s gone. Order now → studexmeat.com', '#AnkoleRibeye #StudExMeat #LimitedStock #PremiumBeef #JHB #Wagyu #BraaiSeason #ScarcityAlert', 'both', 'draft', 'Product Spotlight', '2026-06-04', NULL, NULL, NULL, NULL);

-- calendar_events seed
INSERT INTO calendar_events (date, title, description, platform, campaign, content_item_id, color) VALUES ('2026-06-03', 'Tomahawk Hero Posted ✅', 'Father''s Day campaign launch — Tomahawk hero image live on FB + IG', 'both', 'Fathers Day', NULL, '#22c55e');
INSERT INTO calendar_events (date, title, description, platform, campaign, content_item_id, color) VALUES ('2026-06-04', 'Ankole Scarcity Drop', 'Only 7 Ankole Ribeye left — urgency post', 'both', 'Product Spotlight', NULL, '#ef4444');
INSERT INTO calendar_events (date, title, description, platform, campaign, content_item_id, color) VALUES ('2026-06-05', 'Father''s Day Ad Live', 'Paid ad goes live — R100/day, South Africa ages 25-55', 'facebook', 'Fathers Day', NULL, '#3b82f6');
INSERT INTO calendar_events (date, title, description, platform, campaign, content_item_id, color) VALUES ('2026-06-07', 'Wagyu Burger Patties', 'Product spotlight — Saturday braai timing', 'both', 'Product Spotlight', NULL, '#C9A84C');
INSERT INTO calendar_events (date, title, description, platform, campaign, content_item_id, color) VALUES ('2026-06-10', 'Braai Lifestyle', 'Emotional Father''s Day storytelling — father + son braai', 'both', 'Fathers Day', NULL, '#C9A84C');
INSERT INTO calendar_events (date, title, description, platform, campaign, content_item_id, color) VALUES ('2026-06-12', 'Hwende Box Drop 🏆', 'Nicholas Hwende 2x Champ Box reveal + celebration reel', 'both', 'Hwende', NULL, '#8b5cf6');
INSERT INTO calendar_events (date, title, description, platform, campaign, content_item_id, color) VALUES ('2026-06-14', 'Youth Day Teaser', 'Patriotism angle — Youth Day June 16 preview', 'both', 'Youth Day', NULL, '#10b981');
INSERT INTO calendar_events (date, title, description, platform, campaign, content_item_id, color) VALUES ('2026-06-15', 'Father''s Day Push 🎁', 'Last-day push + WhatsApp broadcast — VIP box + Tomahawk', 'both', 'Fathers Day', NULL, '#C9A84C');
INSERT INTO calendar_events (date, title, description, platform, campaign, content_item_id, color) VALUES ('2026-06-16', 'Youth Day 🇿🇦', 'Feed the Nation — Youth Day post', 'both', 'Youth Day', NULL, '#10b981');
INSERT INTO calendar_events (date, title, description, platform, campaign, content_item_id, color) VALUES ('2026-06-19', 'Hwende Fan Repost', 'Fan testimonial or engagement repost', 'instagram', 'Hwende', NULL, '#8b5cf6');
INSERT INTO calendar_events (date, title, description, platform, campaign, content_item_id, color) VALUES ('2026-06-22', 'Hwende Restock Alert', '2x Champ Box restock notification', 'both', 'Hwende', NULL, '#8b5cf6');
INSERT INTO calendar_events (date, title, description, platform, campaign, content_item_id, color) VALUES ('2026-06-26', 'Campaign Wrap', 'Hwende campaign wrap + thank you post', 'both', 'Hwende', NULL, '#8b5cf6');
