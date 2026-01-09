import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCreateJob, useJobs } from "@/hooks/use-jobs";
import { StatusBadge } from "@/components/StatusBadge";
import { Loader2, Clapperboard, Sparkles, ChevronRight, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();
  const [script, setScript] = useState("");
  const { mutate: createJob, isPending } = useCreateJob();
  const { data: jobs, isLoading } = useJobs();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!script.trim()) return;
    
    createJob({ script }, {
      onSuccess: (job) => {
        setLocation(`/job/${job.id}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0c] to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Director Studio v1.0</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50"
          >
            Automated <br />
            Video Production
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            From script to 4K cinematic video in minutes. Powered by Gemini, Pexels, and Shotstack.
          </motion.p>
        </div>

        {/* Create Job Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto mb-20"
        >
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-card rounded-xl p-2 border border-white/10 shadow-2xl">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Describe your scene... (e.g., A futuristic cyberpunk city in the rain, neon lights reflecting on wet pavement, cinematic slow motion)"
                className="w-full bg-transparent border-none text-lg p-6 min-h-[160px] focus:ring-0 placeholder:text-white/20 resize-none font-body leading-relaxed"
              />
              <div className="flex justify-between items-center px-4 pb-2 border-t border-white/5 pt-4">
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                  {script.length} chars
                </span>
                <button
                  type="submit"
                  disabled={isPending || !script.trim()}
                  className="
                    px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wide
                    bg-white text-black hover:bg-white/90 
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-white/20
                    flex items-center gap-2
                  "
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Clapperboard className="w-4 h-4" />
                      Generate Video
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Recent Jobs Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-display font-semibold">Recent Productions</h2>
            <div className="flex gap-2 text-xs text-muted-foreground font-mono">
              <span>TOTAL: {jobs?.length || 0}</span>
              <span>•</span>
              <span>ACTIVE: {jobs?.filter(j => j.status !== 'done' && j.status !== 'failed').length || 0}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : jobs?.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
              <Clapperboard className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No productions yet. Start your first scene above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs?.map((job) => (
                <Link key={job.id} href={`/job/${job.id}`}>
                  <div className="group relative bg-card rounded-xl border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden cursor-pointer h-full flex flex-col">
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <StatusBadge status={job.status} />
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.createdAt && formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-foreground/80 line-clamp-3 font-medium leading-relaxed group-hover:text-white transition-colors">
                        "{job.script}"
                      </p>
                    </div>
                    
                    <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between group-hover:bg-primary/5 transition-colors">
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        JOB ID: #{job.id.toString().padStart(4, '0')}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
