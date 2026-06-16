"use client";

import { motion } from "framer-motion";

export function FadeIn({ children, delay = 0, duration = 1 }: { children: React.ReactNode, delay?: number, duration?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SubtleBlur({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, filter: "brightness(1.2)" }}
      className="transition-all duration-700"
    >
      {children}
    </motion.div>
  );
}

export function PremiumButton({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative py-3 px-8 text-[10px] tracking-[0.4em] uppercase text-white/40 hover:text-white transition-all duration-700 group overflow-hidden ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-white/40 group-hover:w-full transition-all duration-700" />
    </button>
  );
}
