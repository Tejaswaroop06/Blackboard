"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users, Search, ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import ArtisticCanvas from "@/components/ui/ArtisticCanvas";

interface Conversation {
  id: string;
  name: string;
  genre: string;
  memberCount: number;
  lastMessage: {
    content: string;
    author: string;
    time: string;
  } | null;
}

export default function MessengerPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/groups")
      .then((res) => res.json())
      .then((data) => {
        setConversations(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-28 px-6 flex flex-col items-center overflow-y-auto">
      <ArtisticCanvas artist="ROTHKO" opacity={0.1} />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 w-full bg-black/60 backdrop-blur-xl z-20 py-8 border-b border-white/5 px-8 flex justify-between items-center"
      >
        <h2 className="font-[family-name:var(--font-cursive)] text-5xl text-white/90 drop-shadow-lg">Blackboard</h2>
        <div className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-bold">
          Messenger / Conversations
        </div>
      </motion.div>

      <div className="w-full max-w-3xl space-y-12">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extralight tracking-tight mb-2 text-white/90">Whispers.</h1>
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase">Your private sanctuary of words.</p>
          </div>
          <Link 
            href="/groups"
            className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-white/20 hover:text-white transition-colors"
          >
            <Users size={16} />
            Find New Circles
          </Link>
        </header>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
               <div className="w-4 h-4 border-t border-white/20 rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-32 border border-dashed border-white/5 rounded-3xl">
              <MessageSquare size={32} className="mx-auto text-white/5 mb-6" />
              <p className="text-[10px] tracking-[0.5em] uppercase text-white/20">The silence is absolute.</p>
              <Link href="/groups" className="mt-8 inline-block text-[9px] tracking-[0.2em] uppercase text-white/40 border border-white/10 px-6 py-3 rounded-full hover:bg-white/5 transition-all">
                Manifest a Connection
              </Link>
            </div>
          ) : (
            conversations.map((conv) => (
              <Link 
                key={conv.id} 
                href={`/groups/${conv.id}`}
                className="block group"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex items-center gap-8 group-hover:bg-white/[0.04] transition-all duration-700 group-hover:border-white/10"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white/40 group-hover:scale-105 transition-all duration-700">
                    <MessageCircle size={28} strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-2">
                       <h3 className="text-xl font-light text-white/80 group-hover:text-white transition-colors">{conv.name}</h3>
                       <span className="text-[8px] tracking-widest text-white/10 uppercase italic">{conv.genre}</span>
                    </div>
                    
                    {conv.lastMessage ? (
                      <p className="text-sm font-extralight text-white/30 truncate group-hover:text-white/50 transition-colors">
                        <span className="text-white/10 font-bold mr-2 uppercase tracking-tighter">{conv.lastMessage.author}:</span>
                        {conv.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm font-extralight text-white/10 italic">No whispers yet...</p>
                    )}
                  </div>
                  
                  <div className="text-white/0 group-hover:text-white/20 transition-all duration-700 transform translate-x-4 group-hover:translate-x-0">
                    <ArrowRight size={20} />
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 text-[10px] tracking-[0.4em] uppercase text-white/20 z-30 bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border border-white/5">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="/feed" className="hover:text-white transition-colors">Feed</Link>
        <Link href="/messenger" className="text-white">Messenger</Link>
        <Link href="/groups" className="hover:text-white transition-colors">Groups</Link>
        <Link href="/lounges" className="hover:text-white transition-colors">Lounges</Link>
      </div>
    </main>
  );
}
