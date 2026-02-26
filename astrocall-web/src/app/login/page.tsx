"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Sparkles, Chrome } from "lucide-react";

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "astrologer") {
        router.replace("/astro");
      } else {
        router.replace("/astrologers");
      }
    }
  }, [loading, user, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-20">
      {/* Background radial glow */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="absolute right-0 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="relative overflow-hidden rounded-[40px] border border-zinc-800 bg-zinc-900/40 p-10 shadow-2xl backdrop-blur-2xl">
          {/* Decorative line at top */}
          <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
              <Sparkles className="h-8 w-8 text-white" />
            </div>

            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500/80">
              AstroCall Premium
            </p>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white focus:outline-none">
              Consult the Heavens
            </h1>

            <form onSubmit={handleEmailLogin} className="mt-10 w-full space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 py-4 pl-12 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 py-4 pl-12 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-amber-500 py-6 text-sm font-bold text-black hover:bg-amber-400 active:scale-[0.98] transition-all"
              >
                {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" /> : "Sign In"}
              </Button>

              <div className="relative flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">OR</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 py-4 text-sm font-semibold text-white hover:bg-zinc-800 transition-all"
              >
                <Chrome className="h-5 w-5" />
                Continue with Google
              </button>
            </form>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          By signing in, you agree to our <span className="text-zinc-400 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-zinc-400 hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </main>
  );
}
