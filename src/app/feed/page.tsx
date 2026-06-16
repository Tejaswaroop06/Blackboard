"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import Link from "next/link";
import ArtisticCanvas from "@/components/ui/ArtisticCanvas";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  resonance: number;
  author: {
    pseudonym: string;
  };
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const MAX_CHARS = 280;

  const fetchPosts = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch("/api/posts?genre=FEED");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        setError("Failed to load posts.");
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    // Refresh every 30 seconds for a "live" feel
    const interval = setInterval(() => fetchPosts(true), 30000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > MAX_CHARS || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, genre: "FEED" }),
      });

      if (res.ok) {
        setContent("");
        fetchPosts(true);
      } else {
        setError("Failed to share your thought.");
      }
    } catch {
      setError("Failed to submit post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResonate = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/resonate`, {
      method: "POST",
    });

    if (res.ok) {
      const data = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, resonance: data.resonance } : p))
      );
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-32 px-6 flex flex-col items-center">
      <ArtisticCanvas artist="VAN_GOGH" opacity={0.1} />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 w-full bg-black/40 backdrop-blur-xl z-20 py-8 border-b border-white/5 px-8 flex justify-between items-center"
      >
        <Link href="/" className="font-[family-name:var(--font-cursive)] text-5xl text-white/90 drop-shadow-lg hover:text-white transition-all">
          Blackboard
        </Link>
        <div className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-bold">
          Feed / Chronological
        </div>
      </motion.div>

      {/* Post Creator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mb-20"
      >
        <form onSubmit={handleSubmit} className="relative group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Whisper into the void..."
            maxLength={MAX_CHARS}
            className="w-full bg-transparent border border-white/10 rounded-2xl p-6 min-h-[140px] text-lg font-light placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all duration-700 resize-none no-scrollbar"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-4">
            <span className={`text-[10px] tracking-widest ${content.length > MAX_CHARS * 0.8 ? 'text-red-500/40' : 'text-white/10'}`}>
              {content.length}/{MAX_CHARS}
            </span>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="text-white/20 hover:text-white transition-colors duration-500 disabled:opacity-0"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        {error && (
          <p className="mt-3 text-red-500/60 text-[10px] tracking-widest uppercase text-center">{error}</p>
        )}
      </motion.div>

      {/* Posts List */}
      <div className="w-full max-w-2xl space-y-16">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-4 h-4 border-t border-white/20 rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group border-l border-white/5 pl-8 py-2 relative"
              >
                <div className="text-sm tracking-[0.2em] uppercase text-white/20 mb-4 flex items-center gap-3">
                  <span className="font-medium text-white/30">{post.author.pseudonym}</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-white/10" />
                  <span className="text-[9px] lowercase italic opacity-60">
                    {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xl font-light leading-relaxed text-white/70 group-hover:text-white/90 transition-all duration-700 whitespace-pre-wrap">
                  {post.content}
                </p>
                
                <div className="mt-8 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center gap-6">
                  <button 
                    onClick={() => handleResonate(post.id)}
                    className="text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-white flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Sparkles size={12} className={post.resonance > 0 ? "text-white" : ""} />
                    Resonate
                  </button>
                  {post.resonance > 0 && (
                    <span className="text-[9px] tracking-[0.2em] text-white/10 uppercase italic">
                      {post.resonance} {post.resonance === 1 ? 'soul resonance' : 'resonances'}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
            {!isLoading && posts.length === 0 && (
              <div className="text-center py-24">
                <p className="text-white/5 text-[10px] tracking-[1em] uppercase">The world is quiet.</p>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
      
      {/* Navigation */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-10 text-[9px] tracking-[0.5em] uppercase text-white/20 z-30 bg-black/40 backdrop-blur-xl px-10 py-4 rounded-full border border-white/5 shadow-2xl">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="/messenger" className="hover:text-white transition-colors">Messenger</Link>
        <Link href="/groups" className="hover:text-white transition-colors">Groups</Link>
        <Link href="/lounges" className="hover:text-white transition-colors">Lounges</Link>
        <Link href="/void" className="hover:text-white transition-colors">The Void</Link>
      </div>
    </main>
  );
}
