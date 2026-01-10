export interface Job {
  id: number;
  script: string;
  status: "pending" | "planning" | "gathering" | "rendering" | "done" | "failed";
  createdAt: Date;
  logs: string[];
  visualPlan: any;
  pexelsVideos: any;
  videoUrl: string | null;
}

export type InsertJob = Omit<Job, "id" | "createdAt" | "status" | "logs" | "visualPlan" | "pexelsVideos" | "videoUrl">;
