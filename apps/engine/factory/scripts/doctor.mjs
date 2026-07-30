import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const checks = [
  ["git", ["--version"]],
  ["gh", ["auth", "status"]],
  ["node", ["--version"]],
  ["bun", ["--version"]],
  ["docker", ["version", "--format", "{{.Server.Version}}"]],
  ["ollama", ["list"]],
  ["mesh-llm", ["--version"]],
  ["tailscale", ["status"]]
];

function run(command, args) {
  try {
    const output = execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
    return { ok: true, output };
  } catch (error) {
    return {
      ok: false,
      output: `${error.stdout ?? ""}${error.stderr ?? error.message}`.trim()
    };
  }
}

async function main() {
  console.log("Dark Factory doctor\n");

  for (const [command, args] of checks) {
    const result = run(command, args);
    const status = result.ok ? "ok" : "missing/failing";
    const firstLine = result.output.split("\n").find(Boolean) ?? "";
    console.log(`${command.padEnd(10)} ${status.padEnd(16)} ${firstLine}`);
  }

  const envExists = existsSync(".env") || existsSync(".env.local");
  console.log(`env        ${envExists ? "ok" : "missing".padEnd(16)} ${envExists ? "local env present" : "copy .env.example to .env.local when ready"}`);

  try {
    const routing = JSON.parse(await readFile("factory/config/model-routing.json", "utf8"));
    console.log(`models     ok               ${Object.keys(routing.routes).join(", ")}`);
  } catch (error) {
    console.log(`models     failing          ${error.message}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
