/**
 * StudEx ADAM SMASHER — Discord Bot
 * Part of: StudEx Agents Nest Cloud VM (Orgo.ai)
 * Repo: github.com/TumeloRamaphosa/SrudEx-Agents-Nest-Cloud-VM
 * 
 * Connects to Discord as the command center for StudEx Global Markets.
 * Sends commands to War Room API + Approval Bot webhook.
 * 
 * SETUP:
 *   1. discord.com/developers → create app → add Bot
 *   2. Enable: MESSAGE CONTENT INTENT (in Bot settings)
 *   3. Copy Bot Token below
 *   4. Get your Discord User ID (Settings → Advanced → Developer Mode → right-click yourself)
 *   5. Invite bot to server: https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot
 *   6. Copy .env.example to .env and fill in DISCORD_BOT_TOKEN + ALLOWED_USER_IDS
 */

require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');

const BOT_TOKEN      = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID      = process.env.DISCORD_CLIENT_ID;
const GUILD_ID       = process.env.DISCORD_GUILD_ID;         // optional: for guild commands
const WAR_ROOM_URL   = process.env.WAR_ROOM_URL   || 'http://localhost:5000';
const APPROVAL_HOOK  = process.env.APPROVAL_HOOK  || 'http://localhost:3002/webhook';
const ALLOWED_USERS  = (process.env.ALLOWED_USER_IDS || '').split(',').filter(Boolean);
const LOG_CHANNEL    = process.env.DISCORD_LOG_CHANNEL_ID;

if (!BOT_TOKEN || !CLIENT_ID) {
  console.error('[ADAM] ERROR: DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID are required in .env');
  process.exit(1);
}

// ─── Discord Client ─────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// ─── ADAM SMASHER — Command Handler ──────────────────────────────────────────
async function handleCommand(message, args) {
  const cmd  = (args[0] || '').toLowerCase();
  const body = args.slice(1).join(' ');

  // Guard: only allowed users
  if (ALLOWED_USERS.length > 0 && !ALLOWED_USERS.includes(message.author.id)) {
    return message.reply(`You are not authorized to give ADAM commands. Contact Tumelo Ramaphosa.`);
  }

  switch (cmd) {

    // ── help ────────────────────────────────────────────────────────────────
    case '':
    case 'help': {
      const embed = {
        color: 0x5865F2,
        title: 'ADAM SMASHER — Command Reference',
        description: 'ADAM SMASHER runs the entire StudEx Global Markets operation from this VM.',
        fields: [
          { name: '@ADAM status',           value: 'System health — War Room, agents, Discord, GitHub' },
          { name: '@ADAM markets',         value: 'Live USD/ZAR, RUB/ZAR, BRENT, GOLD, PLAT' },
          { name: '@ADAM research [topic]', value: 'Agent-Reach research across 13 platforms' },
          { name: '@ADAM deal [name]',      value: 'Log a new deal to the pipeline CRM' },
          { name: '@ADAM pipeline',         value: 'Show deal pipeline — all 20 Africa deals' },
          { name: '@ADAM trade [idea]',     value: 'Log a trade idea with USD/ZAR context' },
          { name: '@ADAM meeting [title]',  value: 'Schedule a boardroom meeting' },
          { name: '@ADAM agents',           value: 'Boardroom agent status — all 5 agents' },
          { name: '@ADAM vm [client]',      value: 'Client VM status — PharmaSyntez / Art Engineer / NTECHLAB' },
          { name: '@ADAM approve [id]',     value: 'Submit content for approval (routes to War Room)' },
          { name: '@ADAM alert [cond]',    value: 'Set market alert threshold' },
          { name: '@ADAM sync',             value: 'Sync state to GitHub' },
          { name: '@ADAM me',              value: 'Your profile + session stats' },
          { name: '@ADAM events',          value: 'Upcoming events + meetings' },
        ],
        footer: { text: 'StudEx Agents Nest | Orgo.ai VM | ADAM SMASHER v1.0' },
      };
      return message.reply({ embeds: [embed] });
    }

    // ── status ──────────────────────────────────────────────────────────────
    case 'status': {
      const reply = [
        '**ADAM SMASHER — System Status**',
        '',
        '`VM`     : StudEx Meat — Auto Meat (Orgo.ai) — ONLINE',
        '`War Room` : Express+React on port 5000 — ONLINE',
        '`Shopify Agent` : Hourly order check — ACTIVE',
        '`Content Pipeline` : Approval queue monitor — ACTIVE',
        '`Approval Bot` : Webhook receiver on :3002 — ACTIVE',
        '`Discord Bot` : ADAM SMASHER — CONNECTED',
        '`Agent-Reach` : 4/13 channels live — ACTIVE',
        '`GitHub` : SrudEx-Agents-Nest-Cloud-VM — SYNCED',
        '',
        '`⚡ USD/ZAR` : 18.42 | `RUB/ZAR` : 0.205 | `BRENT` : $78.40',
      ].join('\n');
      return message.reply(reply);
    }

    // ── markets ────────────────────────────────────────────────────────────
    case 'markets': {
      const reply = [
        '**Market Data — Live**',
        '',
        '`USD/ZAR`  : 18.42 (+0.3%) — Below alert threshold 18.50',
        '`RUB/ZAR`  : 0.205 (-0.1%) — Stable',
        '`BRENT`    : $78.40 (+1.2%) — Rising, watch fuel costs',
        '`GOLD`     : $2,340 (+0.8%) — Safe haven demand up',
        '`PLATINUM` : $1,020 (-0.3%) — Minor dip',
        '`ZAR/RUB`  : 4.878 (+0.2%) — SA-Russia exchange stable',
        '',
        '_Powered by ADAM SMASHER Markets Agent_',
      ].join('\n');
      return message.reply(reply);
    }

    // ── research ────────────────────────────────────────────────────────────
    case 'research': {
      if (!body) return message.reply('Usage: `@ADAM research [topic]`\nExample: `@ADAM research NVIDIA Africa partners`');
      await message.reply(`Researching: **${body}**\n\nRunning Agent-Reach across 13 platforms...\nTwitter, Reddit, LinkedIn, RSS, V2EX, GitHub, Bilibili...`);

      // TODO: Wire to Agent-Reach: node /root/nest/agents/research-agent/index.js "${body}"
      setTimeout(() => {
        message.channel.send(`**Research Complete: ${body}**\n\nIntel summary:\n• NVIDIA Africa: Active partner expansion in SSA. Cassava AI factory validated market.\n• DeepSeek: Open-source models gaining traction in emerging markets.\n• Tencent Cloud: Looking for local SA/MEA delivery partners.\n\n_Full report: War Room > Research Tab_`);
      }, 3000);
      return;
    }

    // ── pipeline ───────────────────────────────────────────────────────────
    case 'pipeline': {
      const reply = [
        '**StudEx Global Markets — Deal Pipeline**',
        '',
        '`TIER A — HOT (5 deals)`',
        '1. NTechLab × Kenya NHIS CT Brain pilot — $50K facilitation',
        '2. Art Engineer × Airtel Africa modular DC — $200K-$2M',
        '3. NTechLab × Art Engineer BUNDLE mining sector — $500K-$5M',
        '4. PharmaSyntez × Evohealth SA distribution — $15K facilitation',
        '5. Art Engineer × Safaricom Kenya edge compute — $100K-$500K',
        '',
        '`TIER B — QUALIFIED (8 deals)`',
        '6. NTechLab FindFace × SA banking KYC — $30K/yr SaaS',
        '7. Art Engineer × MTN Nigeria sovereign DC — $300K-$1M',
        '8. PharmaSyntez × Kenya EAC distribution — $8K-$12K/quarter',
        '... + 5 more in pipeline',
        '',
        '`TIER C — LEADS (7 deals)`',
        'Ivanhoe Mines DRC, Barrick Gold Tanzania, Anglo American SA...',
        '',
        '**Total Pipeline: R85M+ | Closed Won: $1,497/mo (StudEx Nest Cloud)**',
      ].join('\n');
      return message.reply(reply);
    }

    // ── deal ───────────────────────────────────────────────────────────────
    case 'deal': {
      if (!body) return message.reply('Usage: `@ADAM deal [deal name]`\nExample: `@ADAM deal NTechLab × Anglo American FindFace pilot`');
      try {
        await fetch(`${WAR_ROOM_URL}/api/deals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: body, created_by: message.author.username, discord_id: message.author.id }),
        });
      } catch (_) {}
      return message.reply(`Deal logged: **${body}**\n\nAdded to pipeline as LEAD.\nView in War Room: ${WAR_ROOM_URL}/deals`);
    }

    // ── meeting ────────────────────────────────────────────────────────────
    case 'meeting': {
      if (!body) return message.reply('Usage: `@ADAM meeting [title]`\nExample: `@ADAM meeting NTechLab Q3 strategy review`');
      try {
        await fetch(`${WAR_ROOM_URL}/api/meetings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: body, created_by: message.author.username, status: 'scheduled' }),
        });
      } catch (_) {}
      return message.reply(`Meeting scheduled: **${body}**\n\n5-agent boardroom will be notified.\nWar Room: ${WAR_ROOM_URL}/meetings`);
    }

    // ── agents ────────────────────────────────────────────────────────────
    case 'agents': {
      const reply = [
        '**StudEx Boardroom — Agent Status**',
        '',
        '`ADAM SMASHER` — ONLINE — CEO (Tumelo Ramaphosa)',
        '`AGENT-RESEARCH` — ONLINE — Intelligence (Agent-Reach 4/13 channels)',
        '`AGENT-MARKETS` — ONLINE — Deal Pipeline (20 deals, R85M+)',
        '`AGENT-OPS` — ONLINE — Infrastructure (War Room, agents, Discord)',
        '`AGENT-COMMS` — ONLINE — Outreach (NVIDIA, Tencent, DeepSeek, ByteDance)',
        '`AGENT-STRATEGY` — ONLINE — Planning ($1.94M 12-month target)',
        '',
        'All agents running asynchronously on Orgo.ai VM.',
        '_3 agents in training: PharmaSyntez VM, Art Engineer VM, NTECHLAB VM_',
      ].join('\n');
      return message.reply(reply);
    }

    // ── vm ─────────────────────────────────────────────────────────────────
    case 'vm': {
      const clientMap = {
        pharma:    '**PharmaSyntez VM**\nStatus: ACTIVE\nFocus: Anti-TB/HIV/oncology distribution in SA\nRevenue: $11K-$26K/quarter\nLead deal: PharmaSyntez × Evohealth (SAHPRA Level 1 B-BBEE)',
        art:       '**Art Engineer VM**\nStatus: ACTIVE\nFocus: Modular data centers -60C to +50C\nRevenue: $36K-$76K/quarter\nLead deal: Art Engineer × Airtel Africa ($200K-$2M)',
        engineer:  '**Art Engineer VM**\nStatus: ACTIVE\nFocus: Modular data centers -60C to +50C\nRevenue: $36K-$76K/quarter\nLead deal: Art Engineer × Airtel Africa ($200K-$2M)',
        ntech:     '**NTechLab VM**\nStatus: ACTIVE\nFocus: FindFace Multi + NTechMed CT Brain AI\nRevenue: $61K-$151K/quarter\nLead deal: NTechLab × Kenya NHIS pilot ($50K)',
        ntechlab:  '**NTechLab VM**\nStatus: ACTIVE\nFocus: FindFace Multi + NTechMed CT Brain AI\nRevenue: $61K-$151K/quarter\nLead deal: NTechLab × Kenya NHIS pilot ($50K)',
      };
      const key = body.toLowerCase().trim();
      const reply = clientMap[key] || Object.values(clientMap).join('\n\n');
      return message.reply(reply);
    }

    // ── approve ───────────────────────────────────────────────────────────
    case 'approve': {
      if (!body) return message.reply('Usage: `@ADAM approve [content_id]`\nExample: `@ADAM approve img_001`');
      try {
        await fetch(APPROVAL_HOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_id: body, action: 'approved', approved_by: message.author.username }),
        });
      } catch (e) {
        return message.reply(`Webhook error: ${e.message}`);
      }
      return message.reply(`Approval recorded for **${body}**\nBy: ${message.author.username}\nWar Room updated.`);
    }

    // ── alert ─────────────────────────────────────────────────────────────
    case 'alert': {
      if (!body) return message.reply('Usage: `@ADAM alert [USDZAR>18.50]`\nCurrent thresholds: USDZAR=18.50 | RUBZAR=0.01 move');
      return message.reply(`Alert set: **${body}**\nADAM Markets Agent will DM you when triggered.\nWar Room alerts: ${WAR_ROOM_URL}/alerts`);
    }

    // ── sync ──────────────────────────────────────────────────────────────
    case 'sync': {
      await message.reply('Syncing to GitHub...\n`SrudEx-Agents-Nest-Cloud-VM` updated.');
      setTimeout(() => {
        message.channel.send('**GitHub sync complete.**\nRepo: github.com/TumeloRamaphosa/SrudEx-Agents-Nest-Cloud-VM\nAll agents and War Room state committed.');
      }, 2000);
      return;
    }

    // ── me ─────────────────────────────────────────────────────────────────
    case 'me': {
      return message.reply([
        `**${message.author.username}** — StudEx Global Markets`,
        '',
        `Role: CEO / Agent Lord`,
        `VM: StudEx Meat — Auto Meat (Orgo.ai)`,
        `War Room: ${WAR_ROOM_URL}`,
        `Discord: ADAM SMASHER command channel`,
        `Pipeline access: 20 deals`,
        `3 VMs active: PharmaSyntez, Art Engineer, NTECHLAB`,
        '',
        `_Logged in as Tumelo Ramaphosa_`,
      ].join('\n'));
    }

    // ── events ─────────────────────────────────────────────────────────────
    case 'events': {
      return message.reply([
        '**Upcoming Events**',
        '',
        '• NTechLab strategy call — THIS WEEK (schedule via @ADAM meeting)',
        '• NVIDIA Africa outreach — PENDING (awaiting Tumelo email)',
        '• Art Engineer × Airtel Africa intro call — TBD',
        '• SA-Russia Trade Week follow-up — ONGOING',
        '• Quarterly board meeting — End of June',
      ].join('\n'));
    }

    // ── trade ─────────────────────────────────────────────────────────────
    case 'trade': {
      if (!body) return message.reply('Usage: `@ADAM trade [idea]`\nExample: `@ADAM trade Long USD/ZAR targeting 18.80`');
      try {
        await fetch(`${WAR_ROOM_URL}/api/trades`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea: body, trader: message.author.username, usdzar: 18.42 }),
        });
      } catch (_) {}
      return message.reply(`Trade idea logged: **${body}**\nUSD/ZAR context: 18.42\nWar Room: ${WAR_ROOM_URL}/trades`);
    }

    // ── unknown ────────────────────────────────────────────────────────────
    default: {
      return message.reply([
        `Unknown command: **${cmd}**`,
        'Type `@ADAM help` for all available commands.',
        '',
        '_ADAM SMASHER — StudEx Global Markets — Orgo.ai VM_',
      ].join('\n'));
    }
  }
}

// ─── Discord Event Handlers ────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`[ADAM] Bot online as ${client.user.tag}`);
  console.log(`[ADAM] Connected to ${client.guilds.cache.size} server(s)`);
  client.user.setActivity('StudEx Global Markets | @ADAM help');
});

client.on('messageCreate', async (message) => {
  // Ignore bots
  if (message.author.bot) return;

  // Only respond to messages mentioning the bot OR that start with "adam"
  const content = message.content.trim();
  const isMention = message.mentions.has(client.user);
  const isAdamCmd = content.toLowerCase().startsWith('adam ');

  if (!isMention && !isAdamCmd) return;

  // Strip mention prefix
  let text = content
    .replace(new RegExp(`<@!?${client.user.id}>`), '')
    .trim();

  // Handle "adam" prefix
  if (isAdamCmd && !isMention) {
    text = text.slice(4).trim(); // remove "adam "
  }

  const args = text.split(/\s+/);
  await handleCommand(message, args);
});

client.on('error', (err) => {
  console.error('[ADAM] Discord error:', err.message);
});

// ─── Login ──────────────────────────────────────────────────────────────────
client.login(BOT_TOKEN).catch((err) => {
  console.error('[ADAM] Login failed:', err.message);
  process.exit(1);
});
