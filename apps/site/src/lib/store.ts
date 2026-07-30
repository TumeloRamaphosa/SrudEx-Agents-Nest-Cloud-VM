import type { FactoryProject } from "./services-data";
import {
  kvDelete,
  kvGetJson,
  kvSetAdd,
  kvSetIfAbsent,
  kvSetJson,
  kvSetMembers,
} from "./kv";

const LEGACY_PROJECTS_KEY = "factory:projects";
const PROJECT_INDEX_KEY = "factory:project-ids";

function projectKey(id: string): string {
  return `factory:project:${id}`;
}

async function writeProject(project: FactoryProject): Promise<void> {
  await kvSetJson(projectKey(project.id), project);
  await kvSetAdd(PROJECT_INDEX_KEY, project.id);
}

async function readLegacyProjects(): Promise<FactoryProject[]> {
  const projects = await kvGetJson<FactoryProject[]>(LEGACY_PROJECTS_KEY);
  return Array.isArray(projects) ? projects : [];
}

export async function getProjects(): Promise<FactoryProject[]> {
  const ids = await kvSetMembers(PROJECT_INDEX_KEY);
  const indexedProjects = await Promise.all(ids.map((id) => kvGetJson<FactoryProject>(projectKey(id))));
  const projects = new Map<string, FactoryProject>();

  for (const project of await readLegacyProjects()) projects.set(project.id, project);
  for (const project of indexedProjects) {
    if (project) projects.set(project.id, project);
  }

  return [...projects.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getProject(id: string): Promise<FactoryProject | null> {
  const project = await kvGetJson<FactoryProject>(projectKey(id));
  if (project) return project;
  const legacyProjects = await readLegacyProjects();
  return legacyProjects.find((item) => item.id === id) ?? null;
}

export async function addProject(project: FactoryProject): Promise<FactoryProject> {
  await writeProject(project);
  return project;
}

export async function updateProjectStatus(
  id: string,
  status: string
): Promise<FactoryProject | null> {
  const project = await getProject(id);
  if (!project) return null;
  project.status = status;
  project.updatedAt = new Date().toISOString();
  await writeProject(project);
  return project;
}

export async function updateProjectPayment(
  id: string,
  stage: "deposit" | "build" | "final"
): Promise<FactoryProject | null> {
  const project = await getProject(id);
  if (!project) return null;
  if (stage === "deposit") project.depositPaid = true;
  else if (stage === "build") project.buildPaid = true;
  else project.finalPaid = true;
  project.updatedAt = new Date().toISOString();
  await writeProject(project);
  return project;
}

export async function recordProjectPayment(
  id: string,
  stage: "deposit" | "build" | "final",
  paymentId: string
): Promise<{ project: FactoryProject | null; alreadyProcessed: boolean }> {
  const project = await getProject(id);
  if (!project) return { project: null, alreadyProcessed: false };

  const processedPaymentIds = project.processedPaymentIds ?? [];
  if (processedPaymentIds.includes(paymentId)) {
    return { project, alreadyProcessed: true };
  }

  const claimKey = `factory:payment:${paymentId}`;
  const claimed = await kvSetIfAbsent(claimKey, new Date().toISOString());
  if (!claimed) return { project, alreadyProcessed: true };

  if (stage === "deposit") {
    project.depositPaid = true;
    project.status = "approved";
  } else if (stage === "build") {
    project.buildPaid = true;
    project.status = "building";
  } else {
    project.finalPaid = true;
    project.status = "delivered";
  }

  project.processedPaymentIds = [...processedPaymentIds, paymentId];
  project.updatedAt = new Date().toISOString();
  try {
    await writeProject(project);
    return { project, alreadyProcessed: false };
  } catch (error) {
    await kvDelete(claimKey);
    throw error;
  }
}
