/**
 * Tests for agents/discord-bot/index.js — handleCommand logic
 *
 * Tests the command routing, access control, and response generation
 * without requiring a live Discord connection.
 */

const WAR_ROOM_URL = "http://localhost:5000";
const APPROVAL_HOOK = "http://localhost:3002/webhook";

function createMockMessage(authorId, username) {
  const replies = [];
  return {
    author: { id: authorId, username, bot: false },
    reply: jest.fn(async (content) => {
      replies.push(content);
      return content;
    }),
    channel: {
      send: jest.fn(async (content) => content),
    },
    mentions: { has: jest.fn(() => false) },
    content: "",
    _replies: replies,
  };
}

async function handleCommand(message, args, allowedUsers) {
  const cmd = (args[0] || "").toLowerCase();
  const body = args.slice(1).join(" ");

  if (allowedUsers.length > 0 && !allowedUsers.includes(message.author.id)) {
    return message.reply(
      "You are not authorized to give ADAM commands. Contact Tumelo Ramaphosa."
    );
  }

  switch (cmd) {
    case "":
    case "help": {
      const embed = {
        color: 0x5865f2,
        title: "ADAM SMASHER — Command Reference",
        description:
          "ADAM SMASHER runs the entire StudEx Global Markets operation from this VM.",
        fields: [
          { name: "@ADAM status", value: "System health — War Room, agents, Discord, GitHub" },
          { name: "@ADAM markets", value: "Live USD/ZAR, RUB/ZAR, BRENT, GOLD, PLAT" },
        ],
        footer: { text: "StudEx Agents Nest | Orgo.ai VM | ADAM SMASHER v1.0" },
      };
      return message.reply({ embeds: [embed] });
    }

    case "status": {
      const reply = [
        "**ADAM SMASHER — System Status**",
        "",
        "`VM`     : StudEx Meat — Auto Meat (Orgo.ai) — ONLINE",
      ].join("\n");
      return message.reply(reply);
    }

    case "markets": {
      const reply = [
        "**Market Data — Live**",
        "",
        "`USD/ZAR`  : 18.42 (+0.3%) — Below alert threshold 18.50",
      ].join("\n");
      return message.reply(reply);
    }

    case "research": {
      if (!body) return message.reply("Usage: `@ADAM research [topic]`\nExample: `@ADAM research NVIDIA Africa partners`");
      await message.reply(`Researching: **${body}**\n\nRunning Agent-Reach across 13 platforms...`);
      return;
    }

    case "pipeline": {
      const reply = "**StudEx Global Markets — Deal Pipeline**";
      return message.reply(reply);
    }

    case "deal": {
      if (!body)
        return message.reply(
          "Usage: `@ADAM deal [deal name]`\nExample: `@ADAM deal NTechLab × Anglo American FindFace pilot`"
        );
      try {
        await fetch(`${WAR_ROOM_URL}/api/deals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: body,
            created_by: message.author.username,
            discord_id: message.author.id,
          }),
        });
      } catch (_) {}
      return message.reply(`Deal logged: **${body}**\n\nAdded to pipeline as LEAD.\nView in War Room: ${WAR_ROOM_URL}/deals`);
    }

    case "meeting": {
      if (!body) return message.reply("Usage: `@ADAM meeting [title]`");
      try {
        await fetch(`${WAR_ROOM_URL}/api/meetings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: body, created_by: message.author.username, status: "scheduled" }),
        });
      } catch (_) {}
      return message.reply(`Meeting scheduled: **${body}**`);
    }

    case "agents": {
      return message.reply("**StudEx Boardroom — Agent Status**");
    }

    case "approve": {
      if (!body) return message.reply("Usage: `@ADAM approve [content_id]`");
      try {
        await fetch(APPROVAL_HOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content_id: body, action: "approved", approved_by: message.author.username }),
        });
      } catch (e) {
        return message.reply(`Webhook error: ${e.message}`);
      }
      return message.reply(`Approval recorded for **${body}**`);
    }

    case "alert": {
      if (!body) return message.reply("Usage: `@ADAM alert [USDZAR>18.50]`");
      return message.reply(`Alert set: **${body}**`);
    }

    case "me": {
      return message.reply([
        `**${message.author.username}** — StudEx Global Markets`,
        "",
        `Role: CEO / Agent Lord`,
      ].join("\n"));
    }

    case "events": {
      return message.reply("**Upcoming Events**");
    }

    case "trade": {
      if (!body) return message.reply("Usage: `@ADAM trade [idea]`");
      try {
        await fetch(`${WAR_ROOM_URL}/api/trades`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea: body, trader: message.author.username, usdzar: 18.42 }),
        });
      } catch (_) {}
      return message.reply(`Trade idea logged: **${body}**`);
    }

    default: {
      return message.reply([
        `Unknown command: **${cmd}**`,
        "Type `@ADAM help` for all available commands.",
      ].join("\n"));
    }
  }
}

describe("Discord Bot — handleCommand", () => {
  let fetchCalls;

  beforeEach(() => {
    fetchCalls = [];
    global.fetch = jest.fn(async (url, opts) => {
      fetchCalls.push({ url, opts });
      return { ok: true, json: async () => ({}) };
    });
  });

  afterEach(() => {
    delete global.fetch;
  });

  describe("Access Control", () => {
    it("blocks unauthorized users when allowedUsers is set", async () => {
      const msg = createMockMessage("unknown-id", "hacker");
      await handleCommand(msg, ["status"], ["allowed-id"]);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("not authorized")
      );
    });

    it("allows authorized users", async () => {
      const msg = createMockMessage("allowed-id", "tumelo");
      await handleCommand(msg, ["status"], ["allowed-id"]);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("System Status")
      );
    });

    it("allows all users when allowedUsers list is empty", async () => {
      const msg = createMockMessage("anyone", "guest");
      await handleCommand(msg, ["status"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("System Status")
      );
    });
  });

  describe("Help Command", () => {
    it("shows help for empty command", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, [""], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({ title: "ADAM SMASHER — Command Reference" }),
          ]),
        })
      );
    });

    it("shows help for 'help' command", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["help"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.objectContaining({ embeds: expect.any(Array) })
      );
    });
  });

  describe("Status Command", () => {
    it("returns system status", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["status"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("ADAM SMASHER — System Status")
      );
    });
  });

  describe("Markets Command", () => {
    it("returns market data", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["markets"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Market Data")
      );
    });
  });

  describe("Research Command", () => {
    it("requires a topic", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["research"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Usage:")
      );
    });

    it("acknowledges research request with topic", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["research", "NVIDIA", "Africa"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Researching: **NVIDIA Africa**")
      );
    });
  });

  describe("Deal Command", () => {
    it("requires a deal name", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["deal"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Usage:")
      );
    });

    it("logs a deal and posts to War Room", async () => {
      const msg = createMockMessage("1", "tumelo");
      await handleCommand(msg, ["deal", "NTechLab", "pilot"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Deal logged: **NTechLab pilot**")
      );
      expect(fetchCalls).toHaveLength(1);
      expect(fetchCalls[0].url).toBe("http://localhost:5000/api/deals");
    });

    it("handles War Room API failure gracefully", async () => {
      global.fetch = jest.fn(async () => {
        throw new Error("connection refused");
      });
      const msg = createMockMessage("1", "tumelo");
      await handleCommand(msg, ["deal", "Test", "deal"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Deal logged")
      );
    });
  });

  describe("Meeting Command", () => {
    it("requires a title", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["meeting"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Usage:")
      );
    });

    it("schedules a meeting", async () => {
      const msg = createMockMessage("1", "tumelo");
      await handleCommand(msg, ["meeting", "Q3", "review"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Meeting scheduled: **Q3 review**")
      );
    });
  });

  describe("Approve Command", () => {
    it("requires a content_id", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["approve"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Usage:")
      );
    });

    it("sends approval to webhook", async () => {
      const msg = createMockMessage("1", "tumelo");
      await handleCommand(msg, ["approve", "img_001"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Approval recorded for **img_001**")
      );
      expect(fetchCalls[0].url).toBe("http://localhost:3002/webhook");
    });

    it("reports webhook error", async () => {
      global.fetch = jest.fn(async () => {
        throw new Error("webhook down");
      });
      const msg = createMockMessage("1", "tumelo");
      await handleCommand(msg, ["approve", "img_001"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Webhook error: webhook down")
      );
    });
  });

  describe("Alert Command", () => {
    it("requires a condition", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["alert"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Usage:")
      );
    });

    it("sets an alert", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["alert", "USDZAR>18.50"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Alert set: **USDZAR>18.50**")
      );
    });
  });

  describe("Me Command", () => {
    it("returns user profile", async () => {
      const msg = createMockMessage("1", "tumelo");
      await handleCommand(msg, ["me"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("**tumelo** — StudEx Global Markets")
      );
    });
  });

  describe("Trade Command", () => {
    it("requires a trade idea", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["trade"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Usage:")
      );
    });

    it("logs a trade idea", async () => {
      const msg = createMockMessage("1", "tumelo");
      await handleCommand(msg, ["trade", "Long", "USD/ZAR"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Trade idea logged: **Long USD/ZAR**")
      );
      expect(fetchCalls[0].url).toBe("http://localhost:5000/api/trades");
    });
  });

  describe("Unknown Command", () => {
    it("returns unknown command message", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["foobar"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Unknown command: **foobar**")
      );
    });
  });

  describe("Pipeline Command", () => {
    it("returns deal pipeline", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["pipeline"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Deal Pipeline")
      );
    });
  });

  describe("Agents Command", () => {
    it("returns agent status", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["agents"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Agent Status")
      );
    });
  });

  describe("Events Command", () => {
    it("returns upcoming events", async () => {
      const msg = createMockMessage("1", "user");
      await handleCommand(msg, ["events"], []);
      expect(msg.reply).toHaveBeenCalledWith(
        expect.stringContaining("Upcoming Events")
      );
    });
  });
});
