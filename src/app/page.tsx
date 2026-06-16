"use client";

import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ArtisticCanvas from "@/components/ui/ArtisticCanvas";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 relative overflow-hidden font-sans">
      <ArtisticCanvas artist="ROTHKO" opacity={0.05} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="text-center z-10 flex flex-col items-center"
      >
        <h1 className="font-[family-name:var(--font-cursive)] text-8xl md:text-[12rem] text-white leading-none mb-4 tracking-[-0.05em] drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          Blackboard
        </h1>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.5 }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-sm md:text-lg font-light tracking-[0.6em] uppercase text-white/40">
            {session ? `Identity: ${session.user?.pseudonym}` : "Sanctuary for the Unsocial"}
          </p>
          <div className="w-12 h-px bg-white/10 mt-4" />
        </motion.div>

        <motion.nav 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 max-w-2xl"
        >
          {status === "authenticated" ? (
            <>
              <NavLink href="/messenger" label="Messenger" />
              <NavLink href="/feed" label="Feed" />
              <NavLink href="/groups" label="Groups" />
              <NavLink href="/lounges" label="Lounges" />
              <NavLink href="/void" label="The Void" />
              
              <div className="w-full flex justify-center mt-8">
                <button 
                  onClick={() => signOut()}
                  className="text-white/10 hover:text-red-500/40 transition-all duration-700 text-[9px] tracking-[0.5em] uppercase border border-white/5 px-6 py-2 rounded-full hover:border-red-500/20"
                >
                  Dissolve Session
                </button>
              </div>
            </>
          ) : (
            <Link 
              href="/auth/signup"
              className="text-white/40 hover:text-white transition-all duration-700 text-[10px] tracking-[0.5em] uppercase group flex flex-col items-center gap-3"
            >
              Enter the Void
              <div className="w-8 h-px bg-white/10 group-hover:w-16 group-hover:bg-white transition-all duration-700" />
            </Link>
          )}
        </motion.nav>
      </motion.div>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.02] via-transparent to-transparent blur-3xl" />
      </div>
    </main>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href}
      className="text-white/20 hover:text-white transition-all duration-700 text-[10px] tracking-[0.5em] uppercase group relative py-2"
    >
      {label}
      <span className="absolute bottom-0 left-0 w-0 h-px bg-white/40 group-hover:w-full transition-all duration-700" />
    </Link>
  );
}
