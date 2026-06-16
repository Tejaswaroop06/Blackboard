"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import ArtisticCanvas from "@/components/ui/ArtisticCanvas";

interface Post {
  id: string;
  content: string;
  createdAt: string;
}

export default function TheVoid() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVoidPosts = useCallback(async () => {
    const res = await fetch("/api/posts?genre=VOID");
    if (res.ok) {
      const data = await res.json();
      setPosts(data);
    }
  }, []);

  useEffect(() => {
    fetchVoidPosts();
  }, [fetchVoidPosts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, genre: "VOID" }),
      });

      if (res.ok) {
        setContent("");
        await fetchVoidPosts();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pt-40 pb-28 px-6 flex flex-col items-center overflow-y-auto">
      <ArtisticCanvas artist="MUNCH" opacity={0.2} />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 w-full z-10 py-12 px-8 flex flex-col items-center"
      >
        <h2 className="font-[family-name:var(--font-cursive)] text-6xl text-white/90 drop-shadow-2xl mb-2">The Void</h2>
        <div className="text-[10px] tracking-[0.6em] uppercase text-white/40 font-bold">
          Scream into the silence / No echoes
        </div>
      </motion.div>

      {/* Void Input */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-lg mt-12 mb-24 z-10"
      >
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Let it out..."
            className="w-full bg-transparent text-center text-2xl font-extralight text-white placeholder:text-white/10 focus:outline-none transition-all duration-1000 resize-none min-h-[150px] no-scrollbar"
          />
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="text-white/20 hover:text-white transition-all duration-1000 group"
          >
            <Trash2 size={24} strokeWidth={1} className="group-hover:scale-110 transition-transform duration-1000" />
            <div className="text-[8px] tracking-[0.4em] uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">Release</div>
          </button>
        </form>
      </motion.div>

      {/* The Floating Void Posts */}
      <div className="w-full max-w-4xl relative min-h-[400px]">
        <AnimatePresence>
          {posts.map((post, index) => {
            // Use post.id to generate semi-stable "random" values
            const seed = post.id.charCodeAt(0) + post.id.charCodeAt(post.id.length - 1);
            const duration = 10 + (seed % 5);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                animate={{ 
                  opacity: [0, 0.3, 0], 
                  scale: [0.8, 1, 1.2],
                  filter: ["blur(10px)", "blur(0px)", "blur(15px)"],
                  y: [0, -100 - (index * 20)],
                  x: [0, (index % 2 === 0 ? 50 : -50)]
                }}
                transition={{ 
                  duration: duration, 
                  ease: "linear",
                  times: [0, 0.4, 1]
                }}
                className="absolute left-1/2 -translate-x-1/2 text-white/40 text-center w-full pointer-events-none px-4"
              >
                <p className="text-lg font-extralight tracking-tight italic">
                  &quot;{post.content}&quot;
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 text-[10px] tracking-[0.4em] uppercase text-white/20 z-30 bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border border-white/5">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="/feed" className="hover:text-white transition-colors">Feed</Link>
        <Link href="/messenger" className="hover:text-white transition-colors">Messenger</Link>
        <Link href="/groups" className="hover:text-white transition-colors">Groups</Link>
        <Link href="/lounges" className="hover:text-white transition-colors">Lounges</Link>
      </div>
    </main>
  );
}
