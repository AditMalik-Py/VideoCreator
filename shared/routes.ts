
import { z } from "zod";
import { Job, InsertJob } from "./types";

import { z } from "zod";

const jobSchema = z.object({
  id: z.number(),
  script: z.string(),
  status: z.enum(["pending", "planning", "gathering", "rendering", "done", "failed"]),
  createdAt: z.date(),
  logs: z.array(z.string()),
  visualPlan: z.any(),
  pexelsVideos: z.any(),
  videoUrl: z.string().nullable(),
});

const insertJobSchema = z.object({
  script: z.string(),
});

export const api = {
  jobs: {
    create: {
      method: "POST" as const,
      path: "/api/jobs",
      input: insertJobSchema,
      responses: {
        201: jobSchema,
        400: z.object({ message: z.string() }),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/jobs/:id",
      responses: {
        200: jobSchema,
        404: z.object({ message: z.string() }),
      },
    },
    list: {
      method: "GET" as const,
      path: "/api/jobs",
      responses: {
        200: z.array(jobSchema),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
