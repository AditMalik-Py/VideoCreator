import { Download, Play } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
  url: string | null;
  thumbnail?: string;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!url) return null;

  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black aspect-video shadow-2xl">
      <video
        src={url}
        controls={isPlaying}
        className="w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none group-hover:bg-black/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-white ml-1 fill-white" />
          </div>
        </div>
      )}

      <a
        href={url}
        download
        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-lg text-white/80 hover:text-white hover:bg-black/70 border border-white/10 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
        title="Download 4K Video"
      >
        <Download className="w-5 h-5" />
      </a>
    </div>
  );
}
