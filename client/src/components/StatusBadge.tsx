import { cn } from "@/lib/utils";
import { Clock, Film, Brain, Clapperboard, CheckCircle2, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    pending: { label: "Queueing", icon: Clock, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
    planning: { label: "Director Planning", icon: Brain, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
    gathering: { label: "Gathering Footage", icon: Film, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    rendering: { label: "Rendering 4K", icon: Clapperboard, color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
    done: { label: "Production Ready", icon: CheckCircle2, color: "text-green-400 bg-green-400/10 border-green-400/20" },
    failed: { label: "Production Failed", icon: XCircle, color: "text-red-400 bg-red-400/10 border-red-400/20" },
  };

  const current = config[status as keyof typeof config] || config.pending;
  const Icon = current.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium uppercase tracking-wider",
      current.color,
      className
    )}>
      <Icon className="w-3.5 h-3.5 animate-pulse" />
      {current.label}
    </div>
  );
}
