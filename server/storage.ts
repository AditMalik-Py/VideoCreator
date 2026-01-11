
import * as localStorage from "./local-storage";
import { Job, InsertJob } from "@shared/types";

export interface IStorage {
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined>;
  listJobs(): Promise<Job[]>;
  appendLog(id: number, message: string): Promise<void>;
}

export class LocalStorage implements IStorage {
  async getJob(id: number): Promise<Job | undefined> {
    return Promise.resolve(localStorage.getJob(id));
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    return Promise.resolve(localStorage.createJob(insertJob));
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    return Promise.resolve(localStorage.updateJob(id, updates));
  }

  async listJobs(): Promise<Job[]> {
    return Promise.resolve(localStorage.listJobs());
  }

  async appendLog(id: number, message: string): Promise<void> {
    return Promise.resolve(localStorage.appendLog(id, message));
  }
}

export const storage = new LocalStorage();
