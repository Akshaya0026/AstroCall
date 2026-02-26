"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
    Sparkles,
    Search,
    LayoutDashboard,
    User,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Don't show navbar on login page or in the call room
    const hideNavbar = pathname === "/login" || pathname === "/" || pathname.startsWith("/call/");
    if (hideNavbar) return null;

    const navLinks = [
        {
            name: "Browse",
            href: "/astrologers",
            icon: Search,
            show: true
        },
        {
            name: "Dashboard",
            href: "/astro",
            icon: LayoutDashboard,
            show: user?.role === "astrologer"
        },
        {
            name: "Profile",
            href: "/profile",
            icon: User,
            show: !!user
        }
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/60 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/astrologers" className="flex items-center gap-2 group">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-white">Astro<span className="text-amber-500">Call</span></span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.filter(link => link.show).map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                                                ? "bg-amber-500/10 text-amber-500"
                                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <link.icon className="h-4 w-4" />
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-zinc-400 hover:text-red-400 hover:bg-red-500/5"
                                    onClick={async () => {
                                        await logout();
                                        router.push("/login");
                                    }}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                                <Link href="/profile" className="h-8 w-8 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 group">
                                    {user.firebaseUser.photoURL ? (
                                        <img src={user.firebaseUser.photoURL} alt="Avatar" className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-amber-500 uppercase">
                                            {user.firebaseUser.displayName?.charAt(0) || "U"}
                                        </div>
                                    )}
                                </Link>
                            </div>
                        ) : (
                            <Button
                                onClick={() => router.push("/login")}
                                size="sm"
                                className="bg-amber-500 text-black hover:bg-amber-400 font-semibold"
                            >
                                Sign In
                            </Button>
                        )}
                    </div>

                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-zinc-400 hover:text-white"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-white/5 bg-zinc-950 px-4 py-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-2">
                        {navLinks.filter(link => link.show).map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${pathname === link.href ? "bg-amber-500/10 text-amber-500" : "text-zinc-400"
                                    }`}
                            >
                                <link.icon className="h-5 w-5" />
                                {link.name}
                            </Link>
                        ))}
                        {user && (
                            <button
                                onClick={async () => {
                                    await logout();
                                    router.push("/login");
                                    setIsMenuOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/5 mt-2 border-t border-white/5 pt-4"
                            >
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
