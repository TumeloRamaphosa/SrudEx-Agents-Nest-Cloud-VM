import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const action = args[0] ?? "status";

function run(command, commandArgs) {
  return execFileSync(command, commandArgs, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

const commands = {
  gpus: ["mesh-llm", ["gpus"]],
  models: ["mesh-llm", ["models", "installed"]],
  status: ["mesh-llm", ["status"]],
  stop: ["mesh-llm", ["stop"]]
};

if (action === "serve") {
  const model = args[1];
  if (!model) {
    console.log("Usage: npm run factory:mesh -- serve <model>");
    process.exit(1);
  }
  console.log(`Run this on the GPU host:\nmesh-llm --model ${model}`);
  process.exit(0);
}

if (action === "client") {
  const token = args[1] ?? "<invite-token>";
  console.log(`Run this on Cursor API-only machines:\nmesh-llm --client --join ${token}`);
  process.exit(0);
}

const selected = commands[action];
if (!selected) {
  console.log("Usage: npm run factory:mesh -- <status|gpus|models|serve|client|stop>");
  process.exitCode = 1;
} else {
  try {
    console.log(run(selected[0], selected[1]));
  } catch (error) {
    console.error(`${error.stdout ?? ""}${error.stderr ?? error.message}`.trim());
    process.exitCode = 1;
  }
}
