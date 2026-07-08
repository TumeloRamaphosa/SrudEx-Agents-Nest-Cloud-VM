import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const command = args[0];

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

function run(commandName, commandArgs, options = {}) {
  return execFileSync(commandName, commandArgs, {
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"]
  }).trim();
}

async function createProject() {
  const slug = slugify(getFlag("slug", getFlag("name", "")));
  if (!slug) throw new Error("Missing --slug <project-slug>");

  const projectDir = path.join("factory", "projects", slug);
  const workspaceDir = path.join(projectDir, "workspace");
  await mkdir(workspaceDir, { recursive: true });
  await mkdir(path.join(projectDir, "deliverables"), { recursive: true });
  await mkdir(path.join(projectDir, "logs"), { recursive: true });

  const metadata = {
    slug,
    createdAt: new Date().toISOString(),
    status: "created",
    githubRepo: getFlag("github-repo", ""),
    linearIssue: getFlag("linear-issue", ""),
    modelEndpoints: {
      ollama: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
      meshLlm: process.env.MESH_LLM_BASE_URL ?? "http://localhost:9337/v1"
    }
  };

  await writeFile(
    path.join(projectDir, "factory.project.json"),
    `${JSON.stringify(metadata, null, 2)}\n`
  );

  await writeFile(
    path.join(projectDir, "Dockerfile"),
    `FROM node:22-slim

WORKDIR /workspace

RUN apt-get update \\
  && apt-get install -y --no-install-recommends git ca-certificates curl python3 make g++ \\
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=development
ENV OLLAMA_BASE_URL=http://host.docker.internal:11434
ENV MESH_LLM_BASE_URL=http://host.docker.internal:9337/v1

CMD ["sleep", "infinity"]
`
  );

  await writeFile(
    path.join(projectDir, "README.md"),
    `# ${slug}

Client project sandbox managed by the StudEx Dark Factory.

- Workspace: \`workspace/\`
- Deliverables: \`deliverables/\`
- Logs: \`logs/\`
- Ollama: \`http://host.docker.internal:11434\`
- Mesh-LLM: \`http://host.docker.internal:9337/v1\`

Start dry-run:

\`\`\`bash
npm run factory:project:start -- --slug ${slug}
\`\`\`

Start live container:

\`\`\`bash
npm run factory:project:start -- --slug ${slug} --live
\`\`\`
`
  );

  console.log(`Created ${projectDir}`);
}

async function startProject() {
  const slug = slugify(getFlag("slug", ""));
  if (!slug) throw new Error("Missing --slug <project-slug>");

  const projectDir = path.join("factory", "projects", slug);
  if (!existsSync(projectDir)) throw new Error(`Project not found: ${projectDir}`);

  const image = `dark-factory-${slug}`;
  const container = `dark-factory-${slug}`;
  const live = hasFlag("live");

  const commands = [
    `docker build -t ${image} ${projectDir}`,
    `docker rm -f ${container} >/dev/null 2>&1 || true`,
    `docker run -d --name ${container} --cpus=4 --memory=8g -v "$PWD/${projectDir}/workspace:/workspace" -e OLLAMA_BASE_URL=http://host.docker.internal:11434 -e MESH_LLM_BASE_URL=http://host.docker.internal:9337/v1 ${image}`
  ];

  if (!live) {
    console.log(commands.join("\n"));
    console.log("\nDry-run only. Add --live to execute.");
    return;
  }

  run("docker", ["build", "-t", image, projectDir], { stdio: "inherit" });
  try {
    run("docker", ["rm", "-f", container]);
  } catch {
    // Container may not exist yet.
  }
  const id = run("docker", [
    "run",
    "-d",
    "--name",
    container,
    "--cpus=4",
    "--memory=8g",
    "-v",
    `${process.cwd()}/${projectDir}/workspace:/workspace`,
    "-e",
    "OLLAMA_BASE_URL=http://host.docker.internal:11434",
    "-e",
    "MESH_LLM_BASE_URL=http://host.docker.internal:9337/v1",
    image
  ]);
  console.log(`Started ${container}: ${id}`);
}

async function statusProject() {
  const slug = slugify(getFlag("slug", ""));
  if (!slug) throw new Error("Missing --slug <project-slug>");

  const projectDir = path.join("factory", "projects", slug);
  const metadataPath = path.join(projectDir, "factory.project.json");
  const metadata = existsSync(metadataPath)
    ? await readFile(metadataPath, "utf8")
    : "{}";

  console.log(metadata);
  try {
    console.log(run("docker", ["ps", "--filter", `name=dark-factory-${slug}`]));
  } catch {
    console.log("Docker status unavailable.");
  }
}

function stopProject() {
  const slug = slugify(getFlag("slug", ""));
  if (!slug) throw new Error("Missing --slug <project-slug>");
  const container = `dark-factory-${slug}`;
  console.log(run("docker", ["rm", "-f", container]));
}

if (command === "create") await createProject();
else if (command === "start") await startProject();
else if (command === "status") await statusProject();
else if (command === "stop") stopProject();
else {
  console.log("Usage: node factory/scripts/project.mjs <create|start|status|stop> --slug <project-slug> [--live]");
  process.exitCode = 1;
}
