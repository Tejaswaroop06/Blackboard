"use client";

import { motion } from "framer-motion";

interface TunerScaleProps {
  currentFrequency: number;
  onFrequencyChange?: (freq: number) => void;
}

export default function TunerScale({ currentFrequency, onFrequencyChange }: TunerScaleProps) {
  const minFreq = 87.5;
  const maxFreq = 108.0;
  const range = maxFreq - minFreq;
  const steps = range * 10; // 0.1 MHz steps

  return (
    <div className="w-full h-24 relative overflow-hidden flex flex-col justify-end select-none bg-white/[0.02] border-y border-white/5 px-4 rounded-xl">
      {/* Glow Effect at center */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <div className="w-32 h-full bg-white/[0.03] blur-xl" />
      </div>

      <motion.div 
        className="flex items-end gap-2 pb-4"
        animate={{ x: `calc(50% - ${(currentFrequency - minFreq) / range * 100}%)` }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
      >
        {Array.from({ length: steps + 1 }).map((_, i) => {
          const freq = minFreq + i * 0.1;
          const isMajor = i % 10 === 0;
          const isHalf = i % 5 === 0 && !isMajor;

          return (
            <div 
              key={i} 
              className="flex flex-col items-center flex-shrink-0"
              style={{ width: "20px" }}
            >
              {isMajor && (
                <span className="text-[8px] font-mono text-white/40 mb-2">{freq.toFixed(1)}</span>
              )}
              <div 
                className={`w-0.5 rounded-full transition-colors duration-500 ${
                  isMajor ? "h-6 bg-white/30" : isHalf ? "h-4 bg-white/10" : "h-2 bg-white/5"
                }`} 
              />
            </div>
          );
        })}
      </motion.div>

      {/* Center Marker */}
      <div className="absolute left-1/2 bottom-2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
         <div className="w-0.5 h-12 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
      </div>
    </div>
  );
}
