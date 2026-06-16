"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const [pseudonym, setPseudonym] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudonym, email, password }),
      });

      if (res.ok) {
        router.push("/auth/signin?message=verify-email");
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("Signup network error:", err);
      setError("Failed to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-sm mx-auto px-6"
      >
        {/* Logo */}
        <h1 className="font-[family-name:var(--font-cursive)] text-6xl text-white mb-10 text-center">
          Blackboard
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Pseudonym"
            value={pseudonym}
            onChange={(e) => setPseudonym(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors duration-500 tracking-wider font-light"
            required
            autoComplete="username"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors duration-500 tracking-wider font-light"
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Secret Key (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors duration-500 tracking-wider font-light"
            required
            autoComplete="new-password"
          />

          {error && (
            <p className="text-red-500/70 text-[10px] tracking-widest uppercase text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-2 border border-white/10 hover:border-white/40 text-white/60 hover:text-white transition-all duration-500 text-[10px] tracking-[0.4em] uppercase disabled:opacity-40"
          >
            {isSubmitting ? "Creating..." : "Create Identity"}
          </button>
        </form>

        {/* Footer link */}
        <p className="mt-10 text-center text-[10px] tracking-[0.2em] uppercase text-white/20">
          Already known?{" "}
          <Link href="/auth/signin" className="text-white/50 hover:text-white transition-colors duration-300">
            Sign In
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
