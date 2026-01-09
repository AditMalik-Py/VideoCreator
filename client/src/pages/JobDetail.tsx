import { useParams, Link } from "wouter";
import { useJob } from "@/hooks/use-jobs";
import { StatusBadge } from "@/components/StatusBadge";
import { TerminalLogs } from "@/components/TerminalLogs";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ArrowLeft, Loader2, Video, Film, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function JobDetail() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : null;
  const { data: job, isLoading, error } = useJob(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-display font-bold mb-2">Production Not Found</h1>
        <p className="text-muted-foreground mb-6">The requested job ID does not exist or has been removed.</p>
        <Link href="/" className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          Return to Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-foreground font-body">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                Production #{job.id.toString().padStart(4, '0')}
              </h1>
            </div>
          </div>
          <StatusBadge status={job.status} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column: Script & Logs */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 border border-white/5"
            >
              <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Film className="w-4 h-4" />
                Script Source
              </h2>
              <p className="text-lg leading-relaxed text-white/90 font-medium">
                "{job.script}"
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Loader2 className={`w-4 h-4 ${job.status !== 'done' && job.status !== 'failed' ? 'animate-spin' : ''}`} />
                Process Log
              </h2>
              <TerminalLogs logs={job.logs || []} />
            </motion.div>
          </div>

          {/* Right Column: Output */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Video className="w-4 h-4" />
              Final Cut
            </h2>

            {job.status === "done" && job.videoUrl ? (
              <VideoPlayer url={job.videoUrl} />
            ) : (
              <div className="aspect-video bg-black/50 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center p-8 border-dashed">
                {job.status === "failed" ? (
                  <>
                    <AlertCircle className="w-12 h-12 text-destructive/50 mb-4" />
                    <h3 className="text-lg font-medium text-destructive">Render Failed</h3>
                    <p className="text-sm text-muted-foreground mt-2">Check the logs for error details.</p>
                  </>
                ) : (
                  <>
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                      <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Production in Progress</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                      Director AI is currently {job.status}... This usually takes 2-5 minutes.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Visual Plan Summary if available */}
            {job.visualPlan && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                <h3 className="text-sm font-medium text-white mb-4">Director's Visual Plan</h3>
                <div className="flex flex-wrap gap-2">
                  {(job.visualPlan as any).keywords?.map((keyword: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-muted-foreground">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

        </div>
      </main>
    </div>
  );
}
