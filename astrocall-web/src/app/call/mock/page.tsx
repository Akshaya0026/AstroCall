"use client";

import { Sparkles, Mic, Video, Monitor, PhoneOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";

export default function MockCallPage() {
    const router = useRouter();
    const [showRating, setShowRating] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed((prev) => prev + 1000);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
        const seconds = (totalSeconds % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    const handleEnd = () => {
        setShowRating(false);
        router.push("/dashboard");
    };

    return (
        <main className="flex min-h-screen flex-col bg-black text-zinc-50 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 px-6 py-4 bg-zinc-950/50 backdrop-blur-xl">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                            Live Guidance Session
                        </p>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">
                        Session with Anaya • Vedic Expert
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-mono font-medium text-zinc-200">
                            {formatTime(elapsed)}
                        </span>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                        onClick={() => setShowRating(true)}
                    >
                        End Session
                    </Button>
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 relative overflow-hidden bg-zinc-950 p-6">
                <div className="grid h-full w-full grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Astrologer Feed */}
                    <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                        <div className="absolute top-4 left-4 z-20">
                            <span className="px-3 py-1 transparent-blur-amber rounded-xl text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30">
                                Astrologer
                            </span>
                        </div>
                        <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center">
                                <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                                    <Sparkles className="h-10 w-10 text-amber-500" />
                                </div>
                                <p className="text-zinc-400 text-sm font-medium">Anaya is sharing video...</p>
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-4 z-20">
                            <p className="text-sm font-bold text-white">Anaya</p>
                        </div>
                    </div>

                    {/* User Feed */}
                    <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                        <div className="absolute top-4 left-4 z-20">
                            <span className="px-3 py-1 transparent-blur-blue rounded-xl text-[10px] font-bold uppercase tracking-wider text-blue-300 border border-blue-500/30">
                                You
                            </span>
                        </div>
                        <div className="flex h-full w-full items-center justify-center bg-zinc-950">
                            <div className="text-center">
                                <Video className="h-12 w-12 text-zinc-700 mx-auto mb-2" />
                                <p className="text-zinc-600 text-xs">Your camera is off</p>
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-4 z-20">
                            <p className="text-sm font-bold text-white">You</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Control Bar */}
            <div className="p-6 bg-zinc-950 border-t border-zinc-900 flex justify-center items-center gap-4">
                <button className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
                    <Mic className="h-5 w-5" />
                </button>
                <button className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
                    <Video className="h-5 w-5" />
                </button>
                <button className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
                    <Monitor className="h-5 w-5" />
                </button>
                <button
                    onClick={() => setShowRating(true)}
                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                >
                    <PhoneOff className="h-5 w-5" />
                </button>
            </div>

            <style jsx>{`
        .transparent-blur-amber {
            background: rgba(245, 158, 11, 0.1);
            backdrop-filter: blur(8px);
        }
        .transparent-blur-blue {
            background: rgba(59, 130, 246, 0.1);
            backdrop-filter: blur(8px);
        }
      `}</style>

            {/* Rating Modal */}
            {showRating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-sm rounded-[32px] border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-2xl">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
                            <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-center text-zinc-50">
                            How was your session?
                        </h2>
                        <p className="mt-2 text-center text-sm text-zinc-400 leading-relaxed">
                            Your feedback helps our astrologers grow and guides other seekers.
                        </p>

                        <div className="mt-8 flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    className="w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-sm font-bold text-zinc-400 hover:border-amber-500/50 hover:text-amber-500 transition-all active:scale-90"
                                >
                                    {value}
                                </button>
                            ))}
                        </div>

                        <textarea
                            placeholder="Leave a heartfelt note (optional)..."
                            className="mt-6 h-24 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                        />

                        <div className="mt-8 grid grid-cols-2 gap-3">
                            <Button
                                variant="ghost"
                                className="rounded-2xl py-6 text-zinc-400 font-bold hover:bg-zinc-800"
                                onClick={handleEnd}
                            >
                                Skip
                            </Button>
                            <Button
                                className="rounded-2xl py-6 bg-amber-500 text-black font-bold hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                                onClick={handleEnd}
                            >
                                Submit Review
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
