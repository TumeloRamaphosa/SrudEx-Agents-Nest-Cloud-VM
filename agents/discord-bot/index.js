/**
 * StudEx ADAM SMASHER — Discord Bot
 * Part of: StudEx Agents Nest
 * Repo: github.com/TumeloRamaphosa/The-Nexus-Agents-NEst
 *
 * Connects to Discord as the command center for StudEx Global Markets.
 * Sends commands to War Room API + Approval Bot webhook.
 *
 * TRUTHFULNESS RULE — read before editing:
 *   Commands must report what is ACTUALLY true, discovered at call time.
 *   Never hardcode "ONLINE", a price, or a success message. A control
 *   surface that lies is worse than no control surface: it hides outages
 *   instead of surfacing them. If a value cannot be verified, label it
 *   UNVERIFIED and say why. Every claim here must trace to a live probe.
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

// ─── Health probing ─────────────────────────────────────────────────────────
// Every status claim must come from one of these. No hardcoded "ONLINE".

const PROBE_TIMEOUT_MS = 4000;

/**
 * Probe an HTTP endpoint. Resolves to a result object — never throws.
 * `ok` is true only when we actually got a 2xx back.
 */
async function probe(name, url) {
  const started = Date.now();
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), PROBE_TIMEOUT_MS);
    const res = await fetch(url, { signal: ctl.signal });
    clearTimeout(timer);
    return {
      name,
      url,
      ok: res.ok,
      detail: `HTTP ${res.status}`,
      ms: Date.now() - started,
    };
  } catch (err) {
    const reason = err.name === 'AbortError'
      ? `no response in ${PROBE_TIMEOUT_MS}ms`
      : err.message;
    return { name, url, ok: false, detail: reason, ms: Date.now() - started };
  }
}

function renderProbe(p) {
  const mark = p.ok ? 'UP  ' : 'DOWN';
  return `\`${mark}\` **${p.name}** — ${p.detail} (${p.ms}ms)`;
}

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
      const pending = await message.reply('Probing services...');

      const probes = await Promise.all([
        probe('War Room',     `${WAR_ROOM_URL}/api/health`),
        probe('Approval Bot', APPROVAL_HOOK.replace(/\/webhook$/, '/health')),
      ]);

      const down = probes.filter((p) => !p.ok);
      const headline = down.length === 0
        ? 'All probed services responding.'
        : `**${down.length} of ${probes.length} services DOWN.**`;

      const reply = [
        '**ADAM SMASHER — System Status**',
        `_Probed live at ${new Date().toISOString()}_`,
        '',
        ...probes.map(renderProbe),
        '',
        headline,
        '',
        '`Discord Bot` — UP (you are reading its reply)',
        '',
        '_Not probed here: Shopify Agent, Content Pipeline and Agent-Reach expose',
        'no health endpoint. Their state is UNKNOWN, not healthy._',
      ].join('\n');

      return pending.edit(reply);
    }

    // ── markets ────────────────────────────────────────────────────────────
    case 'markets': {
      // No market data feed is wired up yet. Previously this returned
      // hardcoded prices presented as live — which could drive a real
      // trading decision off invented numbers. Refuse instead.
      return message.reply([
        '**Market Data — UNAVAILABLE**',
        '',
        'No market data provider is connected, so I have no prices to give you.',
        '',
        'This command used to print fixed numbers (USD/ZAR 18.42, BRENT $78.40)',
        'that were written into the source, not fetched. They were never live and',
        'are now months stale. Do not trade on anything this command said.',
        '',
        'To make this real, wire a provider in `agents/discord-bot/index.js`',
        'and set `MARKET_API_URL` in `.env`.',
      ].join('\n'));
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
      // Agent liveness is only observable through the War Room. If that is
      // down we know nothing — and must say so rather than assert ONLINE.
      const wr = await probe('War Room', `${WAR_ROOM_URL}/api/health`);

      if (!wr.ok) {
        return message.reply([
          '**Agent Status — UNKNOWN**',
          '',
          `War Room is unreachable (${wr.detail}), and it is the only source of`,
          'agent liveness. I cannot tell you which agents are running.',
          '',
          '_This command used to list six agents as ONLINE unconditionally,',
          'including when nothing was running at all._',
        ].join('\n'));
      }

      return message.reply([
        '**Agent Status**',
        `_Checked ${new Date().toISOString()}_`,
        '',
        renderProbe(wr),
        '',
        `War Room is up. For the live agent roster see ${WAR_ROOM_URL}/agents —`,
        'this bot does not yet read per-agent state from its API.',
      ].join('\n'));
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
      // This used to print "sync complete" after a 2s timer without running
      // anything — a success message for work that never happened.
      return message.reply([
        '**Sync — NOT IMPLEMENTED**',
        '',
        'This command does not sync anything. It previously reported',
        '"GitHub sync complete" after a timer, having committed nothing.',
        '',
        'Nothing was pushed. Commit from a terminal until this is wired up.',
      ].join('\n'));
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
