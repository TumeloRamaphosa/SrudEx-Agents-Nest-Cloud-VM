import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";

function run(command, args) {
  try {
    return execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch {
    return "";
  }
}

function parseOllamaList(output) {
  return output
    .split("\n")
    .slice(1)
    .map((line) => line.trim().split(/\s+/)[0])
    .filter(Boolean);
}

const ollamaModels = parseOllamaList(run("ollama", ["list"]));
const meshStatus = run("mesh-llm", ["status"]);
const meshModels = run("mesh-llm", ["models", "installed"]);

const preferred = {
  fast: ollamaModels.includes("gemma4:e4b") ? "gemma4:e4b" : ollamaModels[0] ?? "",
  planning: ollamaModels.includes("deepseek-v4-pro:cloud")
    ? "deepseek-v4-pro:cloud"
    : ollamaModels[0] ?? "",
  fallback: ollamaModels.includes("nous-hermes2:latest")
    ? "nous-hermes2:latest"
    : ollamaModels[0] ?? ""
};

const routing = {
  generatedAt: new Date().toISOString(),
  endpoints: {
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
      type: "ollama"
    },
    meshLlm: {
      baseUrl: process.env.MESH_LLM_BASE_URL ?? "http://localhost:9337/v1",
      type: "openai-compatible"
    }
  },
  routes: {
    intake: { endpoint: "ollama", model: preferred.fast, fallback: "phi4-mini:latest" },
    planning: { endpoint: "ollama", model: preferred.planning, fallback: preferred.fallback },
    code: {
      endpoint: "meshLlm",
      model: "deepseek-r4-local",
      fallbackEndpoint: "ollama",
      fallback: preferred.planning
    },
    review: { endpoint: "ollama", model: preferred.planning, fallback: "hermes3:latest" },
    summary: { endpoint: "ollama", model: preferred.fast, fallback: "llama3.2:3b" }
  },
  observed: {
    ollamaModels,
    meshStatus: meshStatus || "mesh-llm is not running or has no active status",
    meshModels: meshModels || "no mesh-managed models observed"
  },
  notes: [
    "Run this script after adding/removing local models.",
    "Use Mesh-LLM for large GPU-hosted models and Ollama as the local fallback."
  ]
};

await writeFile("factory/config/model-routing.json", `${JSON.stringify(routing, null, 2)}\n`);
console.log("Updated factory/config/model-routing.json");
console.log(`Ollama models: ${ollamaModels.join(", ") || "none"}`);
console.log(`Mesh-LLM endpoint: ${routing.endpoints.meshLlm.baseUrl}`);
