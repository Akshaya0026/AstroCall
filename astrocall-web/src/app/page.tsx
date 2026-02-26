"use client";

import Link from "next/link";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-zinc-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 pb-24 pt-16">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <span className="h-6 w-6 rounded-full bg-amber-400/10 ring-1 ring-amber-400/40" />
            <span>AstroCall v1</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            {user ? (
              <>
                <span className="hidden sm:inline">
                  Signed in as{" "}
                  <span className="font-medium text-zinc-100">
                    {user.firebaseUser.displayName ??
                      user.firebaseUser.email}
                  </span>
                </span>
                <Link href="/dashboard">
                  <Button size="sm" variant="outline">
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm" variant="outline">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </header>

        <section className="grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center">
          <div className="space-y-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-amber-200">
              Live video & voice with astrologers
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Call a trusted astrologer
              <span className="block text-amber-300">
                directly in your browser.
              </span>
            </h1>
            <p className="max-w-xl text-balance text-sm text-zinc-400 sm:text-base">
              Browse online astrologers, start a secure audio or video
              call in seconds, and leave a review when you&apos;re done.
              No apps. No friction. Just guidance when you need it.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={user ? "/astrologers" : "/login"}>
                <Button size="lg">
                  {user ? "See online astrologers" : "Start with sign in"}
                </Button>
              </Link>
              <Link href="/astrologers">
                <Button variant="ghost" size="lg">
                  Browse astrologers
                </Button>
              </Link>
            </div>
            <dl className="mt-6 grid max-w-xl grid-cols-2 gap-6 text-xs text-zinc-400 sm:text-sm">
              <div>
                <dt className="font-medium text-zinc-200">
                  Realtime video & voice
                </dt>
                <dd>Powered by LiveKit Cloud, optimized for browsers.</dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-200">
                  Pay‑per‑session friendly
                </dt>
                <dd>Each call is a session you can track and rate.</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 -z-10 rounded-3xl bg-amber-500/10 blur-3xl" />
            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 shadow-xl shadow-amber-500/10">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  3 astrologers online
                </span>
                <span>Live session preview</span>
              </div>
              <div className="space-y-4 px-4 py-5 text-xs text-zinc-300">
                <div className="flex items-center justify-between rounded-2xl bg-zinc-900/80 px-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-50">
                      Anaya • Vedic & Tarot
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      English · Hindi · 5k+ calls
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300">
                    Online
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  Once you&apos;re signed in, you&apos;ll see a live list
                  of available astrologers and can start a secure call
                  in one click.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

