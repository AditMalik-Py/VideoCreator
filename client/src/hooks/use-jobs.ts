import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertJob, type Job } from "@shared/schema";

// GET /api/jobs (List)
export function useJobs() {
  return useQuery({
    queryKey: [api.jobs.list.path],
    queryFn: async () => {
      const res = await fetch(api.jobs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return api.jobs.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/jobs/:id (Single)
export function useJob(id: number | null) {
  return useQuery({
    queryKey: [api.jobs.get.path, id],
    enabled: !!id,
    refetchInterval: (query) => {
      // Poll every 2s if status is active
      const data = query.state.data as Job | undefined;
      if (data && ["pending", "planning", "gathering", "rendering"].includes(data.status)) {
        return 2000;
      }
      return false;
    },
    queryFn: async () => {
      if (!id) throw new Error("No ID");
      const url = buildUrl(api.jobs.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("Job not found");
      if (!res.ok) throw new Error("Failed to fetch job");
      return api.jobs.get.responses[200].parse(await res.json());
    },
  });
}

// POST /api/jobs (Create)
export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertJob) => {
      const validated = api.jobs.create.input.parse(data);
      const res = await fetch(api.jobs.create.path, {
        method: api.jobs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          throw new Error("Invalid input");
        }
        throw new Error("Failed to create job");
      }
      return api.jobs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
    },
  });
}
