"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import {
    User,
    Settings,
    History,
    LogOut,
    ChevronRight,
    Edit2,
    Bell,
    Shield,
    ArrowLeft
} from "lucide-react";

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    if (!user) return null;

    return (
        <main className="min-h-screen bg-black text-zinc-50 pb-20">
            {/* Premium Header Backdrop */}
            <div className="absolute inset-0 h-[40vh] bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative mx-auto max-w-2xl px-4 pt-12">
                <header className="mb-10 flex items-center justify-between">
                    <button
                        onClick={() => router.push("/astrologers")}
                        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to dashboard
                    </button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-red-400"
                        onClick={logout}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </header>

                <div className="space-y-8">
                    {/* User Identity Section */}
                    <section className="flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-zinc-900 bg-zinc-800 shadow-2xl">
                                {user.firebaseUser.photoURL ? (
                                    <img
                                        src={user.firebaseUser.photoURL}
                                        alt={user.firebaseUser.displayName || "User"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-amber-500 bg-gradient-to-br from-zinc-800 to-zinc-900">
                                        {user.firebaseUser.displayName?.charAt(0) || "U"}
                                    </div>
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 text-black border-4 border-black hover:scale-110 transition-transform">
                                <Edit2 className="h-3 w-3" />
                            </button>
                        </div>

                        <h1 className="mt-6 text-2xl font-bold tracking-tight">
                            {user.firebaseUser.displayName || "Astro User"}
                        </h1>
                        <p className="text-zinc-400 text-sm">{user.firebaseUser.email}</p>

                        <div className="mt-4 flex items-center gap-2">
                            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-500 border border-amber-500/20">
                                {user.role} Member
                            </span>
                        </div>
                    </section>

                    {/* Quick Stats/Overview */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Sessions", value: "12", icon: History },
                            { label: "Minutes", value: "450", icon: Shield },
                            { label: "Rating", value: "4.9", icon: User },
                        ].map((stat, i) => (
                            <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-center backdrop-blur-sm">
                                <p className="text-xs text-zinc-500 uppercase tracking-tighter mb-1 font-medium">{stat.label}</p>
                                <p className="text-lg font-semibold text-zinc-100">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Account Settings Section */}
                    <section className="space-y-4">
                        <h3 className="px-2 text-sm font-semibold text-zinc-500 uppercase tracking-wider">Account Settings</h3>
                        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/20 overflow-hidden backdrop-blur-md">
                            {[
                                { label: "Personal Information", sub: "Name, email, and phone", icon: User },
                                { label: "Notifications", sub: "Session alerts and updates", icon: Bell },
                                { label: "Security & Privacy", sub: "Password and data settings", icon: Shield },
                                { label: "Global Settings", sub: "Language and region", icon: Settings },
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    className="flex w-full items-center justify-between p-5 hover:bg-zinc-800/40 transition-colors border-b last:border-0 border-zinc-800/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-zinc-800 text-zinc-400 group-hover:text-amber-500 transition-colors">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-zinc-200">{item.label}</p>
                                            <p className="text-xs text-zinc-500">{item.sub}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="pt-4">
                        <Button
                            variant="ghost"
                            className="w-full h-12 rounded-2xl bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all font-medium"
                            onClick={logout}
                        >
                            Sign Out
                        </Button>
                        <p className="mt-6 text-center text-xs text-zinc-600 tracking-tight">
                            AstroCall v1.0.0 • Connected to Bharat East
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
