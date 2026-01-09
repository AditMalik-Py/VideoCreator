import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";

interface TerminalLogsProps {
  logs: string[];
}

export function TerminalLogs({ logs }: TerminalLogsProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="w-full bg-black/80 rounded-xl border border-white/10 overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
        <Terminal className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">System Output</span>
        <div className="ml-auto flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1.5 min-h-[300px] max-h-[400px]">
        {logs.length === 0 && (
          <div className="text-muted-foreground/50 italic text-center mt-12">
            Waiting for initialization protocol...
          </div>
        )}
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3"
            >
              <span className="text-primary/50 shrink-0">➜</span>
              <span className={log.includes("ERROR") ? "text-red-400" : "text-green-400/90"}>
                {log}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </div>
  );
}
