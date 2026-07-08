import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const action = args[0] ?? "status";
const cashclawPath = process.env.CASHCLAW_PATH ?? "/Users/tumeloramaphosa/cashclaw";

const gated = new Set(["init", "hyrve-poll", "auto-accept", "invoice"]);

function run(command, commandArgs) {
  return execFileSync(command, commandArgs, {
    cwd: cashclawPath,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

if (gated.has(action) && !args.includes("--approved")) {
  console.log(`${action} is approval-gated. Re-run with --approved after operator confirmation.`);
  process.exit(0);
}

const commands = {
  status: ["npm", ["start", "--", "status"]],
  skills: ["npm", ["start", "--", "skills"]],
  help: ["npm", ["start", "--", "--help"]],
  init: ["npm", ["start", "--", "init"]],
  "hyrve-status": ["npm", ["start", "--", "hyrve", "status"]],
  "hyrve-poll": ["npm", ["start", "--", "hyrve", "poll"]],
  "auto-accept": ["npm", ["start", "--", "hyrve", "auto-accept", "on"]]
};

const selected = commands[action];
if (!selected) {
  console.log("Usage: node factory/scripts/cashclaw.mjs <status|skills|help|init|hyrve-status|hyrve-poll|auto-accept> [--approved]");
  process.exitCode = 1;
} else {
  try {
    console.log(run(selected[0], selected[1]));
  } catch (error) {
    console.error(`${error.stdout ?? ""}${error.stderr ?? error.message}`.trim());
    process.exitCode = 1;
  }
}
