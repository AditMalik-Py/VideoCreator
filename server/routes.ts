
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "pexels";
import axios from "axios";

// ------------------------------------------------------------------
// Helper: Video Automation Pipeline
// ------------------------------------------------------------------

// Gemini Setup
const genAI = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "dummy",
  httpOptions: {
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  }
});

// Pexels Setup
// Pexels client requires API Key. If not present, we can't search.
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
let pexelsClient: any;
if (PEXELS_API_KEY) {
  pexelsClient = createClient(PEXELS_API_KEY);
}

// Shotstack Setup
const SHOTSTACK_KEY = process.env.SHOTSTACK_KEY;
const SHOTSTACK_API_URL = "https://api.shotstack.io/edit/stage/render"; // Using Stage (sandbox) environment

async function runVideoPipeline(jobId: number, script: string) {
  try {
    // 1. PLANNING (Gemini)
    await storage.updateJob(jobId, { status: "planning" });
    await storage.appendLog(jobId, "Director Agent: Analyzing script...");

    const prompt = `
      You are a Video Director Agent. Analyze the following script and generate a visual plan.
      Output ONLY valid JSON. 
      Schema:
      [
        { "keyword": "string (search term for stock footage)", "duration": number (seconds, approx 3-5s) }
      ]
      Generate 5-8 clips.
      
      Script: "${script}"
    `;

    const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean markdown if present
    const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const plan = JSON.parse(cleanedJson);
    
    await storage.updateJob(jobId, { visualPlan: plan });
    await storage.appendLog(jobId, `Director Agent: Plan created with ${plan.length} scenes.`);

    // 2. GATHERING (Pexels)
    await storage.updateJob(jobId, { status: "gathering" });
    await storage.appendLog(jobId, "Gatherer Agent: Searching Pexels for footage...");

    if (!pexelsClient) {
      throw new Error("Pexels API Key is missing.");
    }

    const videoClips = [];

    for (const scene of plan) {
      await storage.appendLog(jobId, `Gatherer Agent: Searching for "${scene.keyword}"...`);
      try {
        const searchResult = await pexelsClient.videos.search({
          query: scene.keyword,
          per_page: 5,
          orientation: "portrait",
          size: "large"
        });

        if (searchResult.videos && searchResult.videos.length > 0) {
          // Find highest resolution mp4
          const bestVideo = searchResult.videos[0]; // Simplification: take first relevant result
          const videoFile = bestVideo.video_files
            .sort((a: any, b: any) => (b.width * b.height) - (a.width * a.height))[0]; // Max resolution

          if (videoFile) {
            videoClips.push({
              url: videoFile.link,
              duration: scene.duration,
              keyword: scene.keyword
            });
            await storage.appendLog(jobId, `Gatherer Agent: Found clip for "${scene.keyword}"`);
          } else {
             await storage.appendLog(jobId, `Gatherer Agent: No suitable video file found for "${scene.keyword}"`);
          }
        } else {
          await storage.appendLog(jobId, `Gatherer Agent: No results for "${scene.keyword}"`);
        }
      } catch (err: any) {
        await storage.appendLog(jobId, `Gatherer Agent: Error searching "${scene.keyword}": ${err.message}`);
      }
    }

    await storage.updateJob(jobId, { pexelsVideos: videoClips });

    if (videoClips.length === 0) {
      throw new Error("No video clips were found. Cannot proceed to editing.");
    }

    // 3. EDITING (Shotstack)
    await storage.updateJob(jobId, { status: "rendering" });
    await storage.appendLog(jobId, "Editor Agent: Submitting render job to Shotstack...");

    if (!SHOTSTACK_KEY) {
      throw new Error("Shotstack API Key is missing. Please add SHOTSTACK_KEY to Secrets.");
    }

    // Construct Shotstack JSON
    const shotstackJson = {
      timeline: {
        background: "#000000",
        tracks: [
          {
            clips: videoClips.map((clip) => ({
              asset: {
                type: "video",
                src: clip.url
              },
              start: 0, // Shotstack handles sequential placement if start is auto/0 in sequence? Actually we need to calculate starts or use simple track structure.
              // For simplicity in this demo, let's assume one track, sequential clips. 
              // Wait, Shotstack requires explicit start times or "auto" strategy if available? 
              // Let's just stack them. 
              // Actually, simplest way is to calculate start times.
              length: clip.duration
            }))
            .map((clip, index, array) => {
               // Calculate start time based on previous clips
               const startTime = array.slice(0, index).reduce((acc, curr) => acc + curr.length, 0);
               return { ...clip, start: startTime };
            })
          }
        ]
      },
      output: {
        format: "mp4",
        resolution: "sd", // Using SD for sandbox/speed/quota safety, user asked for 4k but sandbox might limit. Let's try "hd" or "1080" if allowed, user asked for 4k (2160p).
        // size: { width: 2160, height: 3840 } // 4K Portrait
        // Note: Shotstack sandbox often limits to SD/HD. Let's use 1080p portrait for reliability in dev.
        // If user strictly needs 4K, we'd use: resolution: '4k' (if plan allows) or custom dimensions.
        // Let's stick to standard HD portrait for the prototype unless specific requirement dictates strictly 4K even if it fails on free tier.
        // User asked for "4K (2160x3840)". We will try to pass that.
        size: { width: 2160, height: 3840 } 
      }
    };

    const renderResponse = await axios.post(SHOTSTACK_API_URL, shotstackJson, {
      headers: {
        "x-api-key": SHOTSTACK_KEY,
        "Content-Type": "application/json"
      }
    });

    const renderId = renderResponse.data.response.id;
    await storage.appendLog(jobId, `Editor Agent: Render ID ${renderId}. Polling status...`);

    // 4. POLLING
    let status = "queued";
    let videoUrl = "";
    
    while (status !== "done" && status !== "failed") {
      await new Promise(r => setTimeout(r, 3000)); // Wait 3s
      const statusRes = await axios.get(`${SHOTSTACK_API_URL}/${renderId}`, {
        headers: { "x-api-key": SHOTSTACK_KEY }
      });
      
      status = statusRes.data.response.status;
      await storage.appendLog(jobId, `Editor Agent: Render status: ${status}`);

      if (status === "done") {
        videoUrl = statusRes.data.response.url;
      } else if (status === "failed") {
        throw new Error(`Shotstack render failed: ${statusRes.data.response.error}`);
      }
    }

    // 5. FINISH
    // Note: User asked to "Download the final video into a root folder named videos/".
    // In Replit environment, we can save it to local disk if we want, or just return the URL.
    // The requirement says "Return the local file path to the UI".
    // We'll download it.
    
    if (videoUrl) {
      await storage.appendLog(jobId, "Pipeline: Downloading final video...");
      const fs = await import("fs");
      const path = await import("path");
      
      // Ensure videos dir
      const videosDir = path.join(process.cwd(), "videos");
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir);
      }

      const videoPath = path.join(videosDir, `video-${jobId}.mp4`);
      const writer = fs.createWriteStream(videoPath);
      
      const response = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream'
      });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(undefined));
        writer.on('error', reject);
      });

      // Update job with local path (relative for serving?) 
      // Actually we'll serve it via a static route or just give the file name.
      // Let's store the filename.
      await storage.updateJob(jobId, { status: "done", videoUrl: `/videos/video-${jobId}.mp4` });
      await storage.appendLog(jobId, "Pipeline: Success! Video ready.");
    }

  } catch (error: any) {
    console.error("Pipeline Error:", error);
    await storage.appendLog(jobId, `Error: ${error.message}`);
    await storage.updateJob(jobId, { status: "failed" });
  }
}


// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Serve "videos" folder statically
  const express = await import("express");
  const path = await import("path");
  app.use("/videos", express.static(path.join(process.cwd(), "videos")));


  app.post(api.jobs.create.path, async (req, res) => {
    try {
      const input = api.jobs.create.input.parse(req.body);
      const job = await storage.createJob(input);
      
      // Start background process
      runVideoPipeline(job.id, input.script).catch(err => console.error(err));
      
      res.status(201).json(job);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.jobs.get.path, async (req, res) => {
    const job = await storage.getJob(Number(req.params.id));
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  });

  app.get(api.jobs.list.path, async (req, res) => {
    const jobs = await storage.listJobs();
    res.json(jobs);
  });

  return httpServer;
}
