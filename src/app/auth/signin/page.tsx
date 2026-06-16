"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SigninContent() {
  const [pseudonym, setPseudonym] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      pseudonym,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error.includes("Email not verified")) {
        setError("Identity initiated but not verified. Check console for link.");
      } else {
        setError("Invalid Pseudonym or Secret Key.");
      }
    } else {
      router.push("/");
    }
    setIsSubmitting(false);
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

        {/* Status messages */}
        {message === "verify-email" && (
          <p className="mb-6 text-green-500/80 text-center text-[10px] tracking-widest uppercase">
            Identity Initiated. Check your email to verify.
          </p>
        )}
        {message === "verified" && (
          <p className="mb-6 text-green-500/80 text-center text-[10px] tracking-widest uppercase">
            Identity Verified. You may now enter.
          </p>
        )}

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
            type="password"
            placeholder="Secret Key"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors duration-500 tracking-wider font-light"
            required
            autoComplete="current-password"
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
            {isSubmitting ? "Verifying..." : "Verify Identity"}
          </button>
        </form>

        {/* Footer link */}
        <p className="mt-10 text-center text-[10px] tracking-[0.2em] uppercase text-white/20">
          New here?{" "}
          <Link href="/auth/signup" className="text-white/50 hover:text-white transition-colors duration-300">
            Create Identity
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

export default function Signin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SigninContent />
    </Suspense>
  );
}
