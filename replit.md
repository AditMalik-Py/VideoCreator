# AI Director Studio

## Overview

AI Director Studio is an automated video production platform that transforms text scripts into rendered videos. Users submit a script, and the system uses AI agents to plan visual scenes, gather stock footage from Pexels, and render final videos using Shotstack. The application provides real-time job status tracking with a terminal-style log interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state with automatic polling for active jobs
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Animations**: Framer Motion for smooth UI transitions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schema validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Background Processing**: Async video pipeline runs in-process after job creation

### Video Automation Pipeline
The core feature is a multi-stage pipeline triggered when a job is created:
1. **Planning Stage**: Gemini AI analyzes the script and generates a visual plan with keywords and durations
2. **Gathering Stage**: Pexels API searches for stock footage matching the visual plan
3. **Rendering Stage**: Shotstack API composes the final video from gathered clips
4. **Completion**: Video URL is stored and job marked as done

Job status progression: `pending` → `planning` → `gathering` → `rendering` → `done` (or `failed`)

### Data Flow
- Jobs table stores script, status, logs array, visual plan, Pexels videos, and final video URL
- Frontend polls `/api/jobs/:id` every 2 seconds for active jobs to show real-time progress
- Logs are appended server-side and displayed in a terminal-style component

### Shared Code Pattern
- `shared/` directory contains database schema and API route definitions used by both frontend and backend
- Type safety maintained through Drizzle's inferred types and Zod schemas

## External Dependencies

### AI Services
- **Google Gemini AI**: Used via Replit AI Integrations for script analysis and visual planning
  - Models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.5-flash-image
  - Configured through `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL` environment variables

### Stock Footage
- **Pexels API**: Provides royalty-free stock video footage
  - Requires `PEXELS_API_KEY` environment variable
  - Used to search for clips matching AI-generated keywords

### Video Rendering
- **Shotstack API**: Cloud-based video editing and rendering service
  - Requires `SHOTSTACK_KEY` environment variable
  - Uses stage/sandbox environment for development

### Database
- **PostgreSQL**: Primary data store
  - Connection via `DATABASE_URL` environment variable
  - Managed through Drizzle ORM with migrations in `/migrations`

### Session Storage
- **connect-pg-simple**: PostgreSQL session store (available but chat integration uses direct database storage)