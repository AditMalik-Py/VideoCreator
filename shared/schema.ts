
import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  script: text("script").notNull(),
  status: text("status").notNull().default("pending"), // pending, planning, gathering, rendering, done, failed
  logs: jsonb("logs").$type<string[]>().default([]),
  videoUrl: text("video_url"),
  visualPlan: jsonb("visual_plan").$type<any>(), // Store the Gemini plan
  pexelsVideos: jsonb("pexels_videos").$type<any>(), // Store the selected videos
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  script: true,
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
