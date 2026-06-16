"use client";

import { motion, AnimatePresence } from "framer-motion";

export type ArtistStyle = "NONE" | "VAN_GOGH" | "MUNCH" | "SUNRISE" | "GARDEN" | "CAFE" | "ROTHKO" | "CEZANNE" | "GAUGUIN" | "HOPPER";

const MASTERPIECES: Record<Exclude<ArtistStyle, "NONE">, { url: string, name: string }> = {
  VAN_GOGH: {
    url: "/backgrounds/vangogh-starry.jpeg",
    name: "The Starry Night, 1889 (Van Gogh)"
  },
  MUNCH: {
    url: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=2000&auto=format&fit=crop",
    name: "The Scream (Psychological Landscape)"
  },
  SUNRISE: {
    url: "/backgrounds/monet-sunrise.jpeg",
    name: "Impression, Sunrise, 1872 (Claude Monet)"
  },
  GARDEN: {
    url: "/backgrounds/monet-garden.jpeg",
    name: "The Water Lily Pond, 1899 (Claude Monet)"
  },
  CAFE: {
    url: "/backgrounds/vangogh-cafe.jpeg",
    name: "Café Terrace at Night, 1888 (Van Gogh)"
  },
  ROTHKO: {
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2000&auto=format&fit=crop",
    name: "No. 61 (Rust and Blue)"
  },
  CEZANNE: {
    url: "https://images.unsplash.com/photo-1576769971842-3069352e850b?q=80&w=2000&auto=format&fit=crop",
    name: "Mont Sainte-Victoire"
  },
  GAUGUIN: {
    url: "https://images.unsplash.com/photo-1578321272176-b78cb420061e?q=80&w=2000&auto=format&fit=crop",
    name: "Spirit of the Dead Watching"
  },
  HOPPER: {
    url: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=2000&auto=format&fit=crop",
    name: "Nighthawks (The Loneliness)"
  }
};

interface ArtisticCanvasProps {
  artist: ArtistStyle;
  opacity?: number;
  className?: string;
}

export default function ArtisticCanvas({ artist, opacity = 0.3, className = "" }: ArtisticCanvasProps) {
  return (
    <div className={`fixed inset-0 z-[-2] pointer-events-none transition-all duration-1000 overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        {artist !== "NONE" && (
          <motion.div
            key={artist}
            initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            animate={{ opacity: opacity, scale: 1, filter: "blur(5px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(40px)" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            style={{ willChange: "transform, opacity, filter" }}
            className="absolute inset-0"
          >
            {/* The Actual Masterpiece */}
            <img 
              src={MASTERPIECES[artist as keyof typeof MASTERPIECES].url} 
              alt={MASTERPIECES[artist as keyof typeof MASTERPIECES].name}
              className="w-full h-full object-cover mix-blend-screen opacity-50 grayscale-[0.2]"
            />
            
            {/* Artistic Texture & Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)] opacity-80" />
            
            {/* Subliminal Name (Bottom Right) */}
            <div className="absolute bottom-12 right-12 text-[8px] tracking-[0.8em] uppercase text-white/5 font-extralight select-none">
              {MASTERPIECES[artist as keyof typeof MASTERPIECES].name}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Permanent Base Layer */}
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}
