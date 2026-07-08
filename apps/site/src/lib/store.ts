import type { FactoryProject } from "./services-data";
import { kvGetJson, kvSetJson } from "./kv";

/**
 * Project store backed by Vercel KV so state survives across serverless
 * invocations (required for the PayFast ITN webhook to find projects created
 * by a different request). Falls back to an in-memory Map for local dev.
 *
 * Storage layout: a single JSON array under the key `factory:projects`.
 */

const PROJECTS_KEY = "factory:projects";

async function readAll(): Promise<FactoryProject[]> {
  const data = await kvGetJson<FactoryProject[]>(PROJECTS_KEY);
  return Array.isArray(data) ? data : [];
}

async function writeAll(projects: FactoryProject[]): Promise<void> {
  await kvSetJson(PROJECTS_KEY, projects);
}

export async function getProjects(): Promise<FactoryProject[]> {
  const projects = await readAll();
  return projects.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getProject(id: string): Promise<FactoryProject | null> {
  const projects = await readAll();
  return projects.find((p) => p.id === id) ?? null;
}

export async function addProject(project: FactoryProject): Promise<FactoryProject> {
  const projects = await readAll();
  projects.push(project);
  await writeAll(projects);
  return project;
}

export async function updateProjectStatus(
  id: string,
  status: string
): Promise<FactoryProject | null> {
  const projects = await readAll();
  const project = projects.find((p) => p.id === id);
  if (!project) return null;
  project.status = status;
  project.updatedAt = new Date().toISOString();
  await writeAll(projects);
  return project;
}

export async function updateProjectPayment(
  id: string,
  stage: "deposit" | "build" | "final"
): Promise<FactoryProject | null> {
  const projects = await readAll();
  const project = projects.find((p) => p.id === id);
  if (!project) return null;
  if (stage === "deposit") project.depositPaid = true;
  else if (stage === "build") project.buildPaid = true;
  else if (stage === "final") project.finalPaid = true;
  project.updatedAt = new Date().toISOString();
  await writeAll(projects);
  return project;
}
