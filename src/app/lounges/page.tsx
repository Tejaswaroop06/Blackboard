"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic2, ArrowLeft, Radio, Search, SlidersHorizontal, Info, Power, Activity, Signal } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import VoiceRoom from "@/components/voice/VoiceRoom";
import ArtisticCanvas, { ArtistStyle } from "@/components/ui/ArtisticCanvas";
import TunerScale from "@/components/ui/TunerScale";

interface Station {
  id: string;
  name: string;
  frequency: number;
  type: string;
  genre: string;
  description: string;
  source: string;
}

const GENRE_TO_ARTIST: Record<string, ArtistStyle> = {
  LIBRARY: "VAN_GOGH",
  OBSERVATORY: "MUNCH",
  GALLERY: "GAUGUIN",
  ASYNC: "CEZANNE",
  GENERAL: "ROTHKO",
  STATION: "HOPPER",
};

export default function LoungesPage() {
  const { data: session } = useSession();
  const [stations, setStations] = useState<Station[]>([]);
  const [activeRoom, setActiveRoom] = useState<{
    id: string;
    name: string;
    type: "COZY" | "LISTEN" | "POMODORO";
    artist: ArtistStyle;
    frequency: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFreq, setCurrentFreq] = useState(100.0);
  const [isScanning, setIsScanning] = useState(false);

  const fetchStations = useCallback(async () => {
    const res = await fetch("/api/stations");
    if (res.ok) {
      const data = await res.json();
      setStations(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const nearestStation = [...stations].sort((a, b) => 
    Math.abs(a.frequency - currentFreq) - Math.abs(b.frequency - currentFreq)
  )[0];

  const handleTune = (station: Station) => {
    setCurrentFreq(station.frequency);
    setActiveRoom({
      id: station.id,
      name: station.name,
      type: station.type === "STATION" ? "LISTEN" : "COZY",
      artist: (GENRE_TO_ARTIST[station.genre] || "ROTHKO") as ArtistStyle,
      frequency: station.frequency,
    });
  };

  const autoScan = () => {
    setIsScanning(true);
    let count = 0;
    const interval = setInterval(() => {
      setCurrentFreq(prev => {
        const next = prev + 0.1;
        return next > 108.0 ? 87.5 : next;
      });
      count++;
      if (count > 20) {
        clearInterval(interval);
        setIsScanning(false);
        const finalNearest = [...stations].sort((a, b) => 
          Math.abs(a.frequency - currentFreq) - Math.abs(b.frequency - currentFreq)
        )[0];
        if (finalNearest && Math.abs(finalNearest.frequency - currentFreq) < 2.0) {
           handleTune(finalNearest);
        }
      }
    }, 50);
  };

  const isAdmin = (session?.user as any)?.isAdmin;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center overflow-hidden font-sans">
      <ArtisticCanvas artist={activeRoom ? activeRoom.artist : "HOPPER"} opacity={0.1} />
      
      {/* Immersive Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-black/40 backdrop-blur-2xl z-20 py-8 border-b border-white/5 px-8 flex justify-between items-center"
      >
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white/20 hover:text-white transition-colors duration-500">
            <ArrowLeft size={20} />
          </Link>
          <div className="text-left">
            <h1 className="font-[family-name:var(--font-cursive)] text-5xl text-white/90 leading-none">The Spectrum</h1>
            <div className="text-[8px] tracking-[0.4em] uppercase text-white/30 mt-2 font-bold flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
               {isAdmin ? "Broadcast Authority Control" : "Signal Reception Active"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/20 font-bold mb-1.5">Reception Fidelity</span>
              <div className="flex gap-1 h-2 items-end">
                 {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-1 rounded-full transition-all duration-1000 ${i < 4 ? 'bg-white/40 h-full shadow-[0_0_8px_rgba(255,255,255,0.1)]' : 'bg-white/10 h-1/2'}`} />
                 ))}
              </div>
           </div>
           {isAdmin && (
             <button 
              onClick={autoScan}
              disabled={isScanning}
              className="px-8 py-3 rounded-full border border-white/10 bg-white/5 text-[9px] tracking-[0.5em] uppercase font-bold hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
             >
               <Activity size={12} className={isScanning ? "animate-spin" : ""} />
               {isScanning ? "Scanning..." : "Frequency Sweep"}
             </button>
           )}
        </div>
      </motion.div>

      <div className="flex-1 w-full max-w-7xl flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Side: Large Radio Tuner UI */}
        <div className="flex-1 p-12 flex flex-col justify-center items-center space-y-20 border-r border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent">
            <div className="text-center space-y-6">
              <div className="relative inline-block px-16 py-12 rounded-[40px] bg-white/[0.02] border border-white/5 shadow-2xl backdrop-blur-sm">
                 <div className="absolute top-4 left-0 right-0 text-[8px] tracking-[0.6em] uppercase text-white/10 font-bold text-center">Digital Frequency Readout</div>
                 <motion.div 
                  key={currentFreq}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-9xl font-mono tracking-tighter text-white/90 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                 >
                   {currentFreq.toFixed(1)}
                   <span className="text-2xl ml-4 opacity-20 tracking-normal font-sans">MHz</span>
                 </motion.div>
              </div>
              
              {isAdmin && (
                <div className="flex justify-center items-center gap-10 text-white/20">
                   <button 
                    onClick={() => setCurrentFreq(prev => Math.max(87.5, prev - 0.1))} 
                    className="p-5 rounded-full border border-white/5 hover:bg-white/5 hover:text-white transition-all duration-500 hover:border-white/20"
                   >
                     - 0.1
                   </button>
                   <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                   <button 
                    onClick={() => setCurrentFreq(prev => Math.min(108.0, prev + 0.1))} 
                    className="p-5 rounded-full border border-white/5 hover:bg-white/5 hover:text-white transition-all duration-500 hover:border-white/20"
                   >
                     + 0.1
                   </button>
                </div>
              )}
            </div>

            <div className="w-full max-w-3xl px-8">
               <TunerScale currentFrequency={currentFreq} />
            </div>

            {/* Current Signal Status */}
            <div className="h-32 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {nearestStation && Math.abs(nearestStation.frequency - currentFreq) < 0.2 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="flex flex-col items-center space-y-8"
                  >
                    <div className="flex items-center gap-4 px-8 py-3 rounded-full bg-emerald-500/5 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                        <Signal size={14} className="text-emerald-500 animate-pulse" />
                        <span className="text-[10px] tracking-[0.5em] uppercase font-bold text-emerald-500">Master Signal Locked</span>
                    </div>
                    <div className="text-center max-w-lg">
                        <h3 className="text-4xl font-extralight mb-3 text-white/90 tracking-tight">{nearestStation.name}</h3>
                        <p className="text-white/30 text-sm italic font-extralight tracking-wide leading-relaxed">&quot;{nearestStation.description}&quot;</p>
                    </div>
                    <button 
                      onClick={() => handleTune(nearestStation)}
                      className={`px-14 py-5 rounded-full font-bold text-[11px] tracking-[0.5em] uppercase transition-all active:scale-95 shadow-2xl ${
                        isAdmin 
                          ? "bg-red-600 text-white hover:bg-red-500 shadow-red-900/20" 
                          : "bg-white text-black hover:bg-white/90 shadow-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isAdmin ? <Power size={14} /> : <Radio size={14} />}
                        {isAdmin ? "Initiate Transmission" : "Enter Reception"}
                      </div>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center space-y-5"
                  >
                    <div className="flex items-center gap-5 px-8 py-3 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                        <Search size={14} className="text-white/20 animate-pulse" />
                        <span className="text-[10px] tracking-[0.5em] uppercase font-bold text-white/20">Scanning Static...</span>
                    </div>
                    <p className="text-[10px] tracking-[0.3em] text-white/10 uppercase font-light">No signal detected at this offset</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
        </div>

        {/* Right Side: Visual Station Directory Sidebar */}
        <div className="w-full md:w-[480px] bg-black/40 backdrop-blur-3xl border-l border-white/5 flex flex-col overflow-hidden">
           <div className="p-10 pb-6 flex justify-between items-center border-b border-white/5">
              <div>
                <h2 className="text-[11px] tracking-[0.5em] uppercase text-white/60 font-bold mb-1.5">Transmitter Registry</h2>
                <div className="text-[9px] tracking-[0.2em] text-white/20 uppercase font-light">Verified Sanctuary Frequencies</div>
              </div>
              <SlidersHorizontal size={16} className="text-white/10" />
           </div>

           {isLoading ? (
             <div className="flex-1 flex items-center justify-center">
                <div className="w-5 h-5 border-t border-white/20 rounded-full animate-spin" />
             </div>
           ) : (
             <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
                {stations.map(station => {
                  const style = (GENRE_TO_ARTIST[station.genre] || "ROTHKO") as ArtistStyle;
                  const isActive = currentFreq === station.frequency;
                  
                  return (
                    <motion.div 
                      key={station.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleTune(station)}
                      className={`relative overflow-hidden rounded-[32px] border transition-all duration-1000 cursor-pointer group shadow-2xl ${
                        isActive 
                          ? 'border-white/30 ring-1 ring-white/10 bg-white/[0.02]' 
                          : 'border-white/5 hover:border-white/20'
                      }`}
                    >
                      {/* Background Style Preview */}
                      <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-25 transition-opacity duration-1000 grayscale group-hover:grayscale-0">
                         <div className={`w-full h-full bg-gradient-to-br from-white/20 to-transparent`} />
                         <div className="absolute bottom-4 right-6 text-[48px] font-bold text-white/5 italic select-none tracking-tighter">
                            {style.split('_')[0]}
                         </div>
                      </div>

                      <div className="relative z-10 p-8 flex flex-col h-full bg-gradient-to-t from-black via-black/20 to-transparent">
                        <div className="flex justify-between items-start mb-8">
                           <div className="flex flex-col">
                              <span className={`font-mono text-3xl tracking-tighter transition-colors duration-700 ${isActive ? 'text-white' : 'text-white/30 group-hover:text-white/70'}`}>
                                {station.frequency.toFixed(1)}
                                <span className="text-[10px] ml-2 opacity-30 uppercase tracking-widest font-sans">MHz</span>
                              </span>
                              <div className="flex items-center gap-2.5 mt-2">
                                 <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-500 animate-pulse shadow-[0_0_12px_#ef4444]' : 'bg-white/10'}`} />
                                 <span className="text-[9px] tracking-[0.3em] text-white/20 uppercase font-bold">{station.genre}</span>
                              </div>
                           </div>
                           <div className={`p-4 rounded-2xl transition-all duration-700 ${isActive ? 'bg-white/10 text-white shadow-xl' : 'bg-white/5 text-white/10 group-hover:bg-white/10 group-hover:text-white/30'}`}>
                              {station.type === "STATION" ? <Radio size={20} /> : <Mic2 size={20} />}
                           </div>
                        </div>

                        <div className="mt-auto">
                          <h4 className={`text-2xl font-extralight tracking-tight transition-all duration-700 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>
                            {station.name}
                          </h4>
                          <p className="text-[11px] font-extralight leading-relaxed text-white/20 italic mt-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-1000 transform translate-y-3 group-hover:translate-y-0 tracking-wide">
                            &quot;{station.description}&quot;
                          </p>
                        </div>
                      </div>

                      {isActive && (
                        <motion.div 
                          layoutId="sidebar-active-bar"
                          className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                        />
                      )}
                    </motion.div>
                  );
                })}
             </div>
           )}

           <div className="p-10 border-t border-white/5 bg-white/[0.01]">
              <div className="bg-white/[0.03] rounded-[24px] p-8 flex items-start gap-6 border border-white/5 backdrop-blur-sm">
                 <Info size={18} className="text-white/20 flex-shrink-0 mt-1" />
                 <div>
                    <span className="text-[9px] tracking-[0.4em] uppercase text-white/40 font-bold block mb-2">Authority Note</span>
                    <p className="text-[11px] font-extralight leading-relaxed text-white/20 italic tracking-wide">
                      Frequency authority is strictly maintained. Listeners are invited to receive; the Creator alone manifests the transmission.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {activeRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/98 backdrop-blur-3xl">
            <div className="w-full max-w-3xl">
              <VoiceRoom 
                room={activeRoom.name} 
                type={activeRoom.type}
                frequency={activeRoom.frequency}
                clubId={activeRoom.id}
                onClose={() => setActiveRoom(null)} 
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-12 text-[10px] tracking-[0.6em] uppercase text-white/20 z-30 bg-black/80 backdrop-blur-2xl px-16 py-5 rounded-full border border-white/5 shadow-[0_0_50px_rgba(0,0,0,1)]">
        <Link href="/" className="hover:text-white transition-all duration-500 hover:scale-105">Home</Link>
        <Link href="/feed" className="hover:text-white transition-all duration-500 hover:scale-105">Feed</Link>
        <Link href="/messenger" className="hover:text-white transition-all duration-500 hover:scale-105">Messenger</Link>
        <Link href="/groups" className="hover:text-white transition-all duration-500 hover:scale-105">Groups</Link>
        <Link href="/void" className="hover:text-white transition-all duration-500 hover:scale-105">The Void</Link>
      </div>
    </main>
  );
}
