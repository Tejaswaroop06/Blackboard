"use client";

import { useEffect, useState, useRef } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { motion } from "framer-motion";
import { X, AlertCircle, Mic, MicOff, Volume2, VolumeX, Radio, Users } from "lucide-react";

export default function VoiceRoom({ 
  room, 
  onClose,
  type = "COZY",
  frequency,
  clubId
}: { 
  room: string; 
  onClose: () => void;
  type?: "COZY" | "LISTEN" | "POMODORO";
  frequency?: number;
  clubId?: string;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [useSimulation, setUseSimulation] = useState(false);

  useEffect(() => {
    const isPlaceholderUrl = !process.env.NEXT_PUBLIC_LIVEKIT_URL || 
                             process.env.NEXT_PUBLIC_LIVEKIT_URL.includes("your-livekit-url") ||
                             process.env.NEXT_PUBLIC_LIVEKIT_URL === "";
    if (isPlaceholderUrl) {
      setUseSimulation(true);
      return;
    }

    (async () => {
      try {
        const url = `/api/livekit?room=${encodeURIComponent(room)}&type=${type}${clubId ? `&clubId=${clubId}` : ''}`;
        const resp = await fetch(url);
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          setTokenError(data.error || "Failed to connect. Check server configuration.");
          return;
        }
        const data = await resp.json();
        if (!data.token) {
          setTokenError("No token received from server.");
          return;
        }
        setToken(data.token);
      } catch (e) {
        console.error("VoiceRoom token fetch error:", e);
        setTokenError("Could not establish a connection.");
      }
    })();
  }, [room, type]);

  if (useSimulation) {
    return (
      <SimulatedVoiceRoom 
        room={room} 
        type={type} 
        frequency={frequency} 
        onClose={onClose} 
      />
    );
  }

  // Loading state
  if (token === null && !tokenError) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-white/20 text-[10px] tracking-[0.5em] uppercase animate-pulse">
        Establishing Link...
      </div>
    );
  }

  // Error state
  if (tokenError) {
    return (
      <div className="bg-black border border-white/10 rounded-3xl p-10 flex flex-col items-center gap-4 text-center">
        <AlertCircle size={24} className="text-red-500/60" />
        <p className="text-white/40 text-sm font-light">{tokenError}</p>
        <div className="flex gap-4">
          <button
            onClick={() => setUseSimulation(true)}
            className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-[10px] tracking-widest uppercase text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Enter Sandbox Mode
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-[10px] tracking-widest uppercase text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl shadow-white/5"
    >
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <LiveKitRoom
        video={false}
        audio={type !== "LISTEN"}
        token={token!}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        style={{ height: "450px" }}
        onDisconnected={onClose}
      >
        <div className="p-10 h-full flex flex-col">
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                 <span className="text-[10px] font-bold tracking-[0.4em] text-red-500 uppercase">On Air</span>
              </div>
              <h3 className="text-2xl font-light tracking-tight">{frequency ? `${frequency.toFixed(1)} FM` : room}</h3>
            </div>
            {frequency && <div className="text-[10px] tracking-[0.3em] uppercase text-white/20 mt-6">{room}</div>}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <ParticipantLayout />
          </div>

          <div className="mt-8 border-t border-white/5 pt-8 flex flex-col gap-4">
            <div className="flex justify-between items-center text-[8px] tracking-[0.4em] uppercase text-white/20">
               <span>Mode: {type}</span>
               <span>Presence Detected</span>
            </div>
            <ControlBar variation="minimal" controls={{ camera: false, screenShare: false, settings: false }} />
          </div>
        </div>
        <RoomAudioRenderer />
      </LiveKitRoom>
    </motion.div>
  );
}

function ParticipantLayout() {
  const tracks = useTracks(
    [{ source: Track.Source.Microphone, withPlaceholder: true }],
    { onlySubscribed: false }
  );
  
  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {tracks.map((track) => (
        <div key={track.participant.identity} className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square border border-white/5 hover:border-white/10 transition-all group">
          <div className="w-12 h-12 rounded-full bg-white/10 mb-4 flex items-center justify-center overflow-hidden">
             <div className="w-full h-full bg-gradient-to-tr from-white/20 to-transparent" />
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-white/40 group-hover:text-white transition-colors">
            {track.participant.identity}
          </div>
        </div>
      ))}
    </div>
  );
}

interface MockParticipant {
  identity: string;
  isSpeaking: boolean;
  isYou?: boolean;
}

function SimulatedVoiceRoom({
  room,
  type,
  frequency,
  onClose,
}: {
  room: string;
  type: "COZY" | "LISTEN" | "POMODORO";
  frequency?: number;
  onClose: () => void;
}) {
  const [isMuted, setIsMuted] = useState(type === "LISTEN");
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [mockParticipants, setMockParticipants] = useState<MockParticipant[]>([
    { identity: "You", isSpeaking: false, isYou: true },
    { identity: "Solitude", isSpeaking: false },
    { identity: "WanderingSoul", isSpeaking: false },
    { identity: "LofiDrifter", isSpeaking: false },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const staticContextRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const humSourceRef = useRef<OscillatorNode | null>(null);

  // Simulated Speaking of other participants
  useEffect(() => {
    const interval = setInterval(() => {
      setMockParticipants((prev) =>
        prev.map((part) => {
          if (part.isYou) {
            return part; // You only speak based on mic unmute / visualizer input
          }
          // 25% chance of speaking toggle
          return {
            ...part,
            isSpeaking: Math.random() > 0.75,
          };
        })
      );
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Web Audio Oscilloscope Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localAnimationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.shadowBlur = 4;
      ctx.shadowColor = "rgba(255, 255, 255, 0.3)";

      ctx.beginPath();
      
      const width = canvas.width;
      const height = canvas.height;

      if (!isMuted && analyserRef.current) {
        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        // Toggle user speaking state in grid based on actual volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += Math.abs(dataArray[i] - 128);
        }
        const averageVolume = sum / bufferLength;
        setMockParticipants((prev) =>
          prev.map((part) =>
            part.isYou ? { ...part, isSpeaking: averageVolume > 2 } : part
          )
        );
      } else {
        // Breathing idle wave
        const time = Date.now() * 0.003;
        for (let i = 0; i < width; i++) {
          const progress = i / width;
          const amplitude = 12 * Math.sin(time * 0.5) * Math.sin(progress * Math.PI);
          const y = height / 2 + Math.sin(i * 0.04 - time * 3) * amplitude;
          
          if (i === 0) {
            ctx.moveTo(i, y);
          } else {
            ctx.lineTo(i, y);
          }
        }
        setMockParticipants((prev) =>
          prev.map((part) =>
            part.isYou ? { ...part, isSpeaking: false } : part
          )
        );
      }
      
      ctx.stroke();
      localAnimationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(localAnimationId);
    };
  }, [isMuted]);

  // Clean up Web Audio nodes on unmount
  useEffect(() => {
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (noiseSourceRef.current) {
        try { noiseSourceRef.current.stop(); } catch(e){}
      }
      if (humSourceRef.current) {
        try { humSourceRef.current.stop(); } catch(e){}
      }
      if (staticContextRef.current) {
        staticContextRef.current.close();
      }
    };
  }, []);

  const toggleMic = async () => {
    if (!isMuted) {
      setIsMuted(true);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioCtx();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        
        setIsMuted(false);
      } catch (err) {
        console.error("Microphone access denied or error:", err);
        setIsMuted(false); // fall back to simulated wave
      }
    }
  };

  const startStatic = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      staticContextRef.current = ctx;

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      noiseSourceRef.current = noise;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 600;
      filter.Q.value = 0.8;

      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.003; // Quiet background static

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      const hum = ctx.createOscillator();
      hum.type = "sine";
      hum.frequency.value = 60;
      humSourceRef.current = hum;

      const humGain = ctx.createGain();
      humGain.gain.value = 0.0015; // Soft ground hum

      hum.connect(humGain);
      humGain.connect(ctx.destination);

      noise.start();
      hum.start();
      setIsAmbientPlaying(true);
    } catch (e) {
      console.error("Failed to start static:", e);
    }
  };

  const stopStatic = () => {
    if (noiseSourceRef.current) {
      try { noiseSourceRef.current.stop(); } catch(e){}
      noiseSourceRef.current = null;
    }
    if (humSourceRef.current) {
      try { humSourceRef.current.stop(); } catch(e){}
      humSourceRef.current = null;
    }
    if (staticContextRef.current) {
      staticContextRef.current.close();
      staticContextRef.current = null;
    }
    setIsAmbientPlaying(false);
  };

  const toggleStatic = () => {
    if (isAmbientPlaying) {
      stopStatic();
    } else {
      startStatic();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl shadow-white/5"
    >
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-10 h-full flex flex-col" style={{ height: "450px" }}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
               <span className="text-[10px] font-bold tracking-[0.4em] text-emerald-500 uppercase">Sandbox Mode</span>
            </div>
            <h3 className="text-2xl font-light tracking-tight">{frequency ? `${frequency.toFixed(1)} FM` : room}</h3>
          </div>
          {frequency && <div className="text-[10px] tracking-[0.3em] uppercase text-white/20 mt-6">{room}</div>}
        </div>

        {/* Real-time Oscilloscope Canvas */}
        <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-8 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute top-2 left-4 text-[8px] tracking-[0.3em] uppercase text-white/30 font-bold select-none z-10">Tuning Oscilloscope</div>
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={80} 
            className="w-full h-[80px]"
          />
        </div>

        {/* Participant list */}
        <div className="flex-1 overflow-y-auto no-scrollbar mb-4">
          <div className="grid grid-cols-2 gap-4 w-full">
            {mockParticipants.map((part) => (
              <div 
                key={part.identity} 
                className={`bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border transition-all duration-500 group relative ${
                  part.isSpeaking ? "border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.05)] bg-emerald-500/[0.02]" : "border-white/5 hover:border-white/10"
                }`}
              >
                {part.isSpeaking && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                <div className={`w-10 h-10 rounded-full mb-3 flex items-center justify-center overflow-hidden transition-all duration-500 ${
                  part.isSpeaking ? "scale-105 bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-white/40"
                }`}>
                   {part.isYou ? <Users size={16} /> : <Radio size={16} />}
                </div>
                <div className={`text-[10px] tracking-[0.2em] uppercase transition-colors duration-500 ${
                  part.isSpeaking ? "text-emerald-400 font-bold" : "text-white/40 group-hover:text-white"
                }`}>
                  {part.identity} {part.isYou && "(You)"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
          <div className="flex justify-between items-center text-[8px] tracking-[0.4em] uppercase text-white/20">
             <span>Mode: {type}</span>
             <span>Atmospheric Sim Active</span>
          </div>
          
          <div className="flex justify-center items-center gap-6">
            {/* Mic control */}
            {type !== "LISTEN" && (
              <button
                onClick={toggleMic}
                className={`p-4 rounded-full border transition-all duration-500 cursor-pointer ${
                  isMuted 
                    ? "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}

            {/* Static hum control */}
            <button
              onClick={toggleStatic}
              className={`p-4 rounded-full border transition-all duration-500 cursor-pointer ${
                isAmbientPlaying 
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
              title={isAmbientPlaying ? "Turn Off Static" : "Cozy Analog Static"}
            >
              {isAmbientPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
