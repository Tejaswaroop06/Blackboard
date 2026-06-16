"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Library, Telescope, Zap, Image as ImageIcon, LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ArtisticCanvas from "@/components/ui/ArtisticCanvas";

interface Group {
  id: string;
  name: string;
  description: string;
  genre: string;
  frequency: number | null;
  isStation: boolean;
  creator: string;
  _count: {
    members: number;
  };
}

const genreIcons: Record<string, LucideIcon> = {
  GENERAL: Users,
  LIBRARY: Library,
  OBSERVATORY: Telescope,
  ASYNC: Zap,
  GALLERY: ImageIcon,
};

export default function GroupsDiscovery() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGenre, setNewGenre] = useState("GENERAL");
  const [newFrequency, setNewFrequency] = useState("");
  const [isStation, setIsStation] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchGroups = async () => {
    const res = await fetch("/api/groups");
    if (res.ok) {
      const data = await res.json();
      setGroups(data);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newName, 
          genre: newGenre,
          frequency: newFrequency || null,
          isStation: isStation
        }),
      });

      if (res.ok) {
        const group = await res.json();
        router.push(`/groups/${group.id}`);
      } else {
        const data = await res.json();
        const detailedError = data.message ? `${data.error}: ${data.message}` : (data.error || "Failed to initialize group");
        setError(detailedError);
      }
    } catch (err) {
      console.error("Network error during initialization:", err);
      setError("Static interference. Could not reach the server.");
    }
  };

  const handleJoin = async (groupId: string) => {
    const res = await fetch(`/api/groups/${groupId}/join`, {
      method: "POST",
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/groups/${data.clubId}`);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-28 px-6 flex flex-col items-center">
      <ArtisticCanvas artist="SUNRISE" opacity={0.15} />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 w-full bg-black/60 backdrop-blur-xl z-20 py-8 border-b border-white/5 px-8 flex justify-between items-center"
      >
        <h2 className="font-[family-name:var(--font-cursive)] text-5xl text-white/90 drop-shadow-lg">Blackboard</h2>
        <div className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-bold">
          Groups / Spectrum
        </div>
      </motion.div>

      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-extralight tracking-tight mb-2 text-white/90">Find your circle.</h1>
            <p className="text-white/40 text-xs tracking-widest uppercase">Intimate spaces capped at 50 souls.</p>
          </div>
          <button 
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Initialize Group
          </button>
        </div>

        {showCreate && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-12 border border-white/10 rounded-2xl p-8 bg-white/5"
          >
            <form onSubmit={handleCreate} className="space-y-8">
              <input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Group or Station Name"
                className="w-full bg-transparent border-b border-white/10 py-2 text-2xl font-extralight focus:outline-none focus:border-white transition-colors"
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] tracking-widest uppercase text-white/20">Frequency (MHz)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number"
                      step="0.1"
                      min="87.5"
                      max="108.0"
                      value={newFrequency}
                      onChange={(e) => setNewFrequency(e.target.value)}
                      placeholder="e.g. 104.2"
                      className="bg-transparent border-b border-white/10 py-2 text-xl font-light w-32 focus:outline-none focus:border-white transition-colors"
                    />
                    <div className="text-white/20 text-xs italic tracking-tight">Optional. Range: 87.5 - 108.0</div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-4">
                  <label className="text-[10px] tracking-widest uppercase text-white/20">Broadcast Mode</label>
                  <button
                    type="button"
                    onClick={() => setIsStation(!isStation)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-700 w-fit cursor-pointer ${
                      isStation ? "bg-white text-black border-white" : "border-white/10 text-white/40"
                    }`}
                  >
                    <Zap size={14} fill={isStation ? "black" : "none"} />
                    <span className="text-[10px] tracking-[0.2em] uppercase font-bold">
                      {isStation ? "FM Station Active" : "Regular Group"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] tracking-widest uppercase text-white/20">Genre</label>
                <div className="flex flex-wrap gap-3">
                  {Object.keys(genreIcons).map((genre) => {
                    const Icon = genreIcons[genre];
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => setNewGenre(genre)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] tracking-[0.2em] uppercase transition-all duration-500 cursor-pointer ${
                          newGenre === genre ? "border-white text-white bg-white/10" : "border-white/10 text-white/40 hover:border-white/30"
                        }`}
                      >
                        <Icon size={14} />
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-red-500/60 text-xs tracking-widest uppercase">{error}</p>}

              <button 
                type="submit"
                className="px-8 py-3 bg-white text-black text-[10px] tracking-[0.4em] uppercase hover:bg-white/90 transition-colors font-bold cursor-pointer"
              >
                Initialize
              </button>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const Icon = genreIcons[group.genre] || Users;
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all duration-700 group flex flex-col justify-between relative overflow-hidden"
              >
                {group.isStation && (
                  <div className="absolute top-0 right-0 p-1 px-3 bg-white text-black text-[8px] font-bold tracking-widest uppercase">
                    ON AIR
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-white/5 text-white/40 group-hover:text-white transition-colors duration-700">
                      <Icon size={20} />
                    </div>
                    <div className="text-right">
                      {group.frequency && (
                        <div className="text-[12px] font-mono tracking-tighter text-white/80 group-hover:text-white transition-colors">
                          {group.frequency.toFixed(1)} FM
                        </div>
                      )}
                      <div className="text-[8px] tracking-[0.2em] uppercase text-white/20">
                        {group._count.members}/50 souls
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-light mb-1 group-hover:text-white transition-colors">{group.name}</h3>
                  <div className="text-white/20 text-[9px] tracking-wider uppercase mb-4">
                    Created by: <span className="text-white/40 italic">{group.creator}</span>
                  </div>
                  <p className="text-white/40 text-sm font-extralight leading-relaxed mb-8">
                    {group.description || `A sanctuary for ${group.genre.toLowerCase()} interaction.`}
                  </p>
                </div>
                <button 
                  onClick={() => handleJoin(group.id)}
                  className="w-full py-3 border border-white/10 text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-white hover:border-white/40 transition-all duration-700 cursor-pointer"
                >
                  Enter Sanctuary
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 text-[10px] tracking-[0.4em] uppercase text-white/20 z-30 bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border border-white/5">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="/feed" className="hover:text-white transition-colors">Feed</Link>
        <Link href="/messenger" className="hover:text-white transition-colors">Messenger</Link>
        <Link href="/lounges" className="hover:text-white transition-colors">Lounges</Link>
        <Link href="/void" className="hover:text-white transition-colors">The Void</Link>
      </div>
    </main>
  );
}
