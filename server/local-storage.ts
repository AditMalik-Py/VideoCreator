import fs from "fs";
import { Job, InsertJob } from "@shared/types";

const DB_FILE = "local-db.json";

interface Db {
  jobs: Job[];
}

function readDb(): Db {
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return { jobs: [] };
  }
}

function writeDb(db: Db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function listJobs(): Job[] {
  return readDb().jobs;
}

export function getJob(id: number): Job | undefined {
  return readDb().jobs.find((job) => job.id === id);
}

export function createJob(job: InsertJob): Job {
  const db = readDb();
  const newJob: Job = {
    ...job,
    id: db.jobs.length > 0 ? Math.max(...db.jobs.map((j) => j.id)) + 1 : 1,
    createdAt: new Date(),
    status: "pending",
    logs: [],
    visualPlan: null,
    pexelsVideos: null,
    videoUrl: null,
  };
  db.jobs.push(newJob);
  writeDb(db);
  return newJob;
}

export function updateJob(id: number, updates: Partial<Job>): Job | undefined {
  const db = readDb();
  const jobIndex = db.jobs.findIndex((job) => job.id === id);
  if (jobIndex === -1) {
    return undefined;
  }
  const updatedJob = { ...db.jobs[jobIndex], ...updates };
  db.jobs[jobIndex] = updatedJob;
  writeDb(db);
  return updatedJob;
}

export function appendLog(id: number, log: string) {
  const db = readDb();
  const job = db.jobs.find((job) => job.id === id);
  if (job) {
    job.logs.push(log);
    writeDb(db);
  }
}
