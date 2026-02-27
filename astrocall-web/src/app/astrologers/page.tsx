"use client";

import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { firebaseDb } from "../../lib/firebase";

interface Astrologer {
  id: string;
  name: string;
  bio?: string;
  languages?: string;
  photoUrl?: string;
  isOnline?: boolean;
}

import RoleGuard from "../../components/RoleGuard";

export default function AstrologersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [creatingSessionId, setCreatingSessionId] =
    useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(firebaseDb, "astrologers"),
      where("isOnline", "==", true),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Astrologer[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Astrologer, "id">),
      }));
      setAstrologers(data);
    });

    return () => unsubscribe();
  }, []);

  const handleStartCall = async (astro: Astrologer) => {
    if (!user) return;
    setCreatingSessionId(astro.id);

    try {
      const sessionRef = await addDoc(
        collection(firebaseDb, "sessions"),
        {
          userId: user.firebaseUser.uid,
          astroId: astro.id,
          status: "pending",
          createdAt: serverTimestamp(),
        },
      );

      router.push(`/call/${sessionRef.id}`);
    } finally {
      setCreatingSessionId(null);
    }
  };

  return (
    <RoleGuard allowedRole="user">
      <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black px-4 pb-16 pt-10 text-zinc-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">
                Online astrologers
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Pick an astrologer to start a secure voice or video call.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/profile")}
              >
                Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                View dashboard
              </Button>
            </div>
          </header>

          {astrologers.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-400">
              No astrologers are online right now. Keep this tab open –
              the list updates in realtime.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {astrologers.map((astro) => (
                <article
                  key={astro.id}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-semibold text-zinc-50">
                        {astro.name}
                      </h2>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300">
                        Online
                      </span>
                    </div>
                    {astro.bio && (
                      <p className="text-sm text-zinc-400">
                        {astro.bio}
                      </p>
                    )}
                    {astro.languages && (
                      <p className="text-xs text-zinc-500">
                        Languages: {astro.languages}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleStartCall(astro)}
                      disabled={creatingSessionId === astro.id}
                    >
                      {creatingSessionId === astro.id
                        ? "Creating room..."
                        : "Call now"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </RoleGuard>
  );
}

