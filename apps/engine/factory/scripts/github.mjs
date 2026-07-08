import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const action = args[0] ?? "create-repo";

function getFlag(name, fallback = "") {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
}

function hasFlag(name) {
  return args.includes(`--${name}`);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function run(command, commandArgs) {
  return execFileSync(command, commandArgs, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

if (action !== "create-repo") {
  console.log("Usage: npm run factory:github -- create-repo --name <repo-name> [--private] [--live --approved]");
  process.exit(1);
}

const name = slugify(getFlag("name", ""));
if (!name) throw new Error("Missing --name <repo-name>");

const owner = process.env.GITHUB_OWNER ?? "TumeloRamaphosa";
const visibility = hasFlag("public") ? "--public" : "--private";
const command = ["repo", "create", `${owner}/${name}`, visibility, "--description", "Client project managed by StudEx Dark Factory"];

if (!hasFlag("live") || !hasFlag("approved")) {
  console.log(`gh ${command.join(" ")}`);
  console.log("Dry-run only. Add --live --approved after operator approval.");
  process.exit(0);
}

console.log(run("gh", command));
