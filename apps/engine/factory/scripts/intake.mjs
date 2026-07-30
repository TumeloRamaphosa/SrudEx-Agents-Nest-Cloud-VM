import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);

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

function requireString(payload, key) {
  if (!payload[key] || typeof payload[key] !== "string") {
    throw new Error(`Missing required string: ${key}`);
  }
}

async function main() {
  const file = getFlag("file", "factory/inbox/example-intake.json");
  const live = hasFlag("live");
  const raw = await readFile(file, "utf8");
  const intake = JSON.parse(raw);

  requireString(intake, "clientName");
  requireString(intake, "serviceId");
  requireString(intake, "request");
  requireString(intake, "approvalContact");

  const slug = slugify(`${intake.clientName}-${intake.serviceId}`);
  const payload = {
    title: `[${intake.serviceId}] ${intake.clientName}`,
    description: [
      `Client: ${intake.clientName}`,
      `Service: ${intake.serviceId}`,
      `Budget: ${intake.budgetUsd ? `$${intake.budgetUsd}` : "TBD"}`,
      `Due: ${intake.dueDate ?? "TBD"}`,
      `Approval: ${intake.approvalContact}`,
      intake.sourceUrl ? `Source: ${intake.sourceUrl}` : "",
      intake.githubRepo ? `Repo: ${intake.githubRepo}` : "",
      "",
      "Request:",
      intake.request,
      "",
      `Deliverable format: ${intake.deliverableFormat ?? "markdown report and linked files"}`,
      intake.notes ? `Notes: ${intake.notes}` : ""
    ]
      .filter(Boolean)
      .join("\n"),
    labels: ["lead", "needs-scope", intake.serviceId],
    projectSlug: slug,
    nextActions: [
      "Operator approves scope and budget.",
      "Factory creates sandbox and GitHub repo if needed.",
      "Agents report status back to Linear."
    ]
  };

  await mkdir("factory/intakes", { recursive: true });
  const outputPath = path.join("factory", "intakes", `${slug}.linear-dry-run.json`);
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(`Prepared Linear payload: ${outputPath}`);
  if (!live) {
    console.log("Dry-run only. Add --live after LINEAR_API_KEY, team, and project IDs are configured.");
    return;
  }

  if (!process.env.LINEAR_API_KEY) {
    throw new Error("LINEAR_API_KEY is required for --live.");
  }

  console.log("Live Linear creation is intentionally gated. Add the Linear API call after confirming team/project IDs.");
  console.log(`Project slug: ${slug}`);
  console.log(`Payload exists: ${existsSync(outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
