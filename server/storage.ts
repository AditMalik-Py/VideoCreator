
import { db } from "./db";
import { jobs, type Job, type InsertJob } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, updates: Partial<Job>): Promise<Job>;
  listJobs(): Promise<Job[]>;
  appendLog(id: number, message: string): Promise<Job>;
}

export class DatabaseStorage implements IStorage {
  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db.insert(jobs).values(insertJob).returning();
    return job;
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job> {
    const [updated] = await db
      .update(jobs)
      .set(updates)
      .where(eq(jobs.id, id))
      .returning();
    return updated;
  }

  async listJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async appendLog(id: number, message: string): Promise<Job> {
    const job = await this.getJob(id);
    if (!job) throw new Error("Job not found");
    const logs = [...(job.logs || []), message];
    return this.updateJob(id, { logs });
  }
}

export const storage = new DatabaseStorage();
