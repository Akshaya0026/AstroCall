"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRole: "user" | "astrologer" | "admin";
    redirectTo?: string;
}

export default function RoleGuard({
    children,
    allowedRole,
    redirectTo,
}: RoleGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace("/login");
            } else if (user.role !== allowedRole) {
                // Redirection logic
                if (redirectTo) {
                    router.replace(redirectTo);
                } else {
                    // Default redirects
                    if (user.role === "astrologer") {
                        router.replace("/astro");
                    } else {
                        router.replace("/astrologers");
                    }
                }
            }
        }
    }, [user, loading, allowedRole, redirectTo, router]);

    if (loading || !user || user.role !== allowedRole) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-500" />
            </div>
        );
    }

    return <>{children}</>;
}
