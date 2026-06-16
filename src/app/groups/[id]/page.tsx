"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Library, Users, Telescope, Zap, Image as ImageIcon, Sparkles, LucideIcon, ArrowLeft, Mic2, Info } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ArtisticCanvas, { ArtistStyle } from "@/components/ui/ArtisticCanvas";
import VoiceRoom from "@/components/voice/VoiceRoom";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  resonance: number;
  author: {
    pseudonym: string;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
  genre: string;
  posts: Post[];
  frequency: number | null;
  isStation: boolean;
  isMember?: boolean;
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

const GENRE_TO_ARTIST: Record<string, ArtistStyle> = {
  LIBRARY: "VAN_GOGH",
  OBSERVATORY: "MUNCH",
  GALLERY: "GAUGUIN",
  ASYNC: "CEZANNE",
  GENERAL: "ROTHKO",
  STATION: "HOPPER",
};

function getArtistForGenre(genre: string): ArtistStyle {
  return GENRE_TO_ARTIST[genre] || "ROTHKO";
}

export default function GroupMessenger() {
  const { id } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRoom, setActiveRoom] = useState<{
    id: string;
    name: string;
    type: "COZY" | "LISTEN" | "POMODORO";
    artist: ArtistStyle;
    frequency: number | null;
  } | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchGroup = useCallback(async (silent = false) => {
    const res = await fetch(`/api/groups/${id}`);
    if (res.ok) {
      const data = await res.json();
      setGroup(data);
    }
  }, [id]);

  useEffect(() => {
    fetchGroup();
    // Real-time polling for messenger feel
    const interval = setInterval(() => fetchGroup(true), 10000);
    return () => clearInterval(interval);
  }, [fetchGroup]);

  // Scroll to bottom when posts change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [group?.posts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, genre: "CLUB", clubId: id }),
    });

    if (res.ok) {
      setContent("");
      fetchGroup(true);
    }
    setIsSubmitting(false);
  };

  const handleJoin = async () => {
    if (!group) return;
    setIsSubmitting(true);
    try {
      console.log(`Attempting to join group: ${group.id}`);
      const res = await fetch(`/api/groups/${group.id}/join`, {
        method: "POST",
      });

      const data = await res.json();
      
      if (res.ok) {
        console.log("Join successful:", data);
        if (data.clubId && data.clubId !== group.id) {
          router.push(`/groups/${data.clubId}`);
        } else {
          await fetchGroup();
        }
      } else {
        console.error("Join failed:", data.error);
        alert(data.error || "Failed to join sanctuary.");
      }
    } catch (err) {
      console.error("Join network error:", err);
      alert("Could not reach the sanctuary. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResonate = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/resonate`, {
      method: "POST",
    });

    if (res.ok && group) {
      const data = await res.json();
      setGroup({
        ...group,
        posts: group.posts.map(p => p.id === postId ? { ...p, resonance: data.resonance } : p)
      });
    }
  };

  if (!group) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-4 h-4 border-t border-white/20 rounded-full animate-spin" />
    </div>
  );

  const Icon = genreIcons[group.genre] || Users;

  return (
    <main className="h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <ArtisticCanvas artist={getArtistForGenre(group.genre)} opacity={0.1} />
      
      {/* Messenger Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-black/40 backdrop-blur-2xl z-20 py-6 border-b border-white/5 px-8 flex justify-between items-center"
      >
        <div className="flex items-center gap-6">
          <Link href="/groups" className="text-white/20 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="text-left">
            <h2 className="font-[family-name:var(--font-cursive)] text-4xl text-white/90 leading-none">{group.name}</h2>
            <div className="text-[8px] tracking-[0.2em] text-white/30 uppercase mt-1 flex items-center gap-2">
               <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
               {group._count.members} Souls Present
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-3 rounded-full bg-white/5 text-white/20 hover:text-white transition-colors cursor-pointer"
          >
            <Info size={18} />
          </button>
          <button
             onClick={() => setActiveRoom({
              id: group.id,
              name: group.name,
              type: group.isStation ? "LISTEN" : "COZY",
              artist: getArtistForGenre(group.genre),
              frequency: group.frequency
            })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <Mic2 size={14} />
            {group.isStation ? "Tune In" : "Lounge"}
          </button>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Messages List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto no-scrollbar px-6 py-10 space-y-12 pb-32"
        >
          {!group.isMember ? (
             <div className="h-full flex flex-col items-center justify-center space-y-8 max-w-md mx-auto text-center">
                <div className="p-8 rounded-full bg-white/5 text-white/20 border border-white/5">
                   <Icon size={48} strokeWidth={1} />
                </div>
                <div>
                   <h3 className="text-2xl font-light mb-2 tracking-tight">The Circle is Closed</h3>
                   <p className="text-white/40 text-sm font-light leading-relaxed">You must enter the sanctuary to hear the whispers of other souls.</p>
                </div>
                <button
                  onClick={handleJoin}
                  className="px-10 py-4 bg-white text-black text-[10px] tracking-[0.4em] uppercase hover:bg-white/90 transition-colors font-bold rounded-full cursor-pointer shadow-xl active:scale-95"
                >
                  Enter Sanctuary
                </button>
             </div>
          ) : (
            <>
              {group.posts.length === 0 && (
                <div className="h-full flex items-center justify-center opacity-10">
                  <p className="text-[10px] tracking-[1em] uppercase">Void Silence</p>
                </div>
              )}
              {/* Reverse the array to show chronological order if the API returns desc */}
              {[...group.posts].reverse().map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group max-w-2xl relative"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] tracking-[0.1em] uppercase text-white/30 font-bold">{post.author.pseudonym}</span>
                    <span className="text-[8px] text-white/10 italic">
                      {new Date(post.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 group-hover:bg-white/[0.05] transition-all duration-700">
                    <p className="text-lg font-light leading-relaxed text-white/80 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <button 
                      onClick={() => handleResonate(post.id)}
                      className="text-[9px] tracking-[0.2em] uppercase text-white/30 hover:text-white flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles size={10} className={post.resonance > 0 ? "text-white" : ""} />
                      {post.resonance > 0 ? `${post.resonance} Resonances` : "Resonate"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Info Sidebar (Optional Toggle) */}
        <AnimatePresence>
          {showInfo && (
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="w-80 bg-black/60 backdrop-blur-3xl border-l border-white/5 p-8 z-30 hidden lg:block"
            >
              <h3 className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-bold mb-8">Group Intel</h3>
              <div className="space-y-8">
                <div>
                   <label className="text-[8px] tracking-[0.2em] uppercase text-white/20 block mb-2">Description</label>
                   <p className="text-sm font-light text-white/60 leading-relaxed italic">&quot;{group.description || 'A quiet space for unsocial souls.'}&quot;</p>
                </div>
                <div>
                   <label className="text-[8px] tracking-[0.2em] uppercase text-white/20 block mb-2">Genre</label>
                   <div className="flex items-center gap-3 text-white/60">
                      <Icon size={16} />
                      <span className="text-xs tracking-wider uppercase font-light">{group.genre}</span>
                   </div>
                </div>
                {group.frequency && (
                  <div>
                    <label className="text-[8px] tracking-[0.2em] uppercase text-white/20 block mb-2">Frequency</label>
                    <div className="text-xl font-mono text-white/80">{group.frequency.toFixed(1)} MHz</div>
                  </div>
                )}
                <div className="pt-8 border-t border-white/5">
                   <div className="text-[8px] tracking-[0.2em] uppercase text-white/20 mb-4">Origin Soul</div>
                   <div className="text-sm font-light text-white/40">{group.creator}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      {group.isMember && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-8 z-20"
        >
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a whisper..."
                className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 pr-16 text-lg font-light placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all duration-500 resize-none h-16 no-scrollbar"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/20 hover:text-white transition-all duration-500 disabled:opacity-0 cursor-pointer"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* Voice Overlay */}
      <AnimatePresence>
        {activeRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <div className="w-full max-w-2xl">
              <VoiceRoom 
                room={activeRoom.name} 
                type={activeRoom.type}
                frequency={activeRoom.frequency || undefined}
                clubId={activeRoom.id}
                onClose={() => setActiveRoom(null)} 
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
