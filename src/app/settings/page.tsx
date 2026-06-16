"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { ArrowLeft, LogOut, Save, Sparkles, Radio } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [bio, setBio] = useState("");
  const [auraColor, setAuraColor] = useState("#000000");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session?.user) {
      // Fetch profile data
      fetch("/api/user/aura").then(res => res.json()).then(data => {
        if (data.auraColor) setAuraColor(data.auraColor);
      });
    }
  }, [session]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      await fetch("/api/user/aura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auraColor }),
      });

      setMessage("Identity Updated.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Update Failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-28 px-6 flex flex-col items-center overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 w-full bg-black/60 backdrop-blur-xl z-20 py-8 border-b border-white/5 px-8 flex justify-between items-center"
      >
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white/20 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <h2 className="font-[family-name:var(--font-cursive)] text-5xl text-white/90 drop-shadow-lg">Blackboard</h2>
        </div>
        <div className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-bold">
          Identity / Settings
        </div>
      </motion.div>

      <div className="w-full max-w-2xl space-y-12">
        <section>
          <h1 className="text-4xl font-extralight tracking-tight mb-4 text-white/90">
            {session?.user?.isAdmin ? "Creator Sanctum." : "Your Identity."}
          </h1>
          <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-12">
            {session?.user?.isAdmin ? "Overseeing the sanctuary." : "Managed in silence."}
          </p>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 space-y-10">
            <div className="flex justify-between items-start">
               <div>
                  <label className="text-[10px] tracking-widest uppercase text-white/20 block mb-2">Pseudonym</label>
                  <div className="text-2xl font-light text-white/80">{(session?.user as any)?.pseudonym}</div>
                  {session?.user?.isAdmin && <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded text-white/40 uppercase tracking-widest mt-2 inline-block">Primary Creator</span>}
               </div>
               <div className="text-right">
                  <label className="text-[10px] tracking-widest uppercase text-white/20 block mb-2">Email</label>
                  <div className="text-sm font-light text-white/40">{session?.user?.email}</div>
               </div>
            </div>

            <div className="space-y-8">
              {/* Creator-Only Controls */}
              {session?.user?.isAdmin && (
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-6">
                   <h3 className="text-[10px] tracking-[0.4em] uppercase text-white/60 font-bold border-b border-white/5 pb-4 flex items-center gap-2">
                     <Radio size={12} />
                     Frequency Authority
                   </h3>
                   
                   <div>
                    <label className="text-[8px] tracking-[0.3em] uppercase text-white/20 block mb-3">Broadcast Frequencies</label>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                          <div className="text-sm font-light text-white/60">The Master Broadcast</div>
                          <div className="text-xs font-mono text-white/20">100.0 MHz</div>
                       </div>
                    </div>
                    <p className="text-[9px] text-white/10 italic mt-3">Broadcast power is locked to your identity.</p>
                   </div>
                </div>
              )}

              {/* Shared Settings */}
              <div className="space-y-6">
                <label className="text-[10px] tracking-widest uppercase text-white/20 block mb-3 flex items-center gap-2">
                  <Sparkles size={12} />
                  Aura Tint
                </label>
                <div className="flex items-center gap-6">
                   <input 
                    type="color" 
                    value={auraColor}
                    onChange={(e) => setAuraColor(e.target.value)}
                    className="w-12 h-12 bg-transparent border-none cursor-pointer rounded-full overflow-hidden"
                   />
                   <div className="text-[10px] tracking-widest text-white/20 uppercase">
                      Select your soul&apos;s digital resonance color.
                   </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex justify-between items-center">
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-3 text-red-500/60 hover:text-red-500 transition-colors text-[10px] tracking-[0.4em] uppercase font-bold"
              >
                <LogOut size={14} />
                Dissolve Identity
              </button>

              <div className="flex items-center gap-6">
                {message && <span className="text-[10px] tracking-widest uppercase text-emerald-500/60 animate-pulse">{message}</span>}
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-3 px-8 py-3 bg-white text-black text-[10px] tracking-[0.4em] uppercase font-bold hover:bg-white/80 transition-all disabled:opacity-50"
                >
                  <Save size={14} />
                  {isSaving ? "Saving..." : "Commit"}
                </button>
              </div>
            </div>
          </div>
        </section>
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
