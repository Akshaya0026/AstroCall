"use client";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { firebaseDb } from "../../lib/firebase";

interface SessionRow {
  id: string;
  status: string;
  startedAt?: { seconds: number; nanoseconds: number };
  userId: string;
}

export default function AstrologerDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!user) return;

    const astroRef = doc(firebaseDb, "astrologers", user.firebaseUser.uid);
    const unsub = onSnapshot(astroRef, (snap) => {
      if (!snap.exists()) {
        return;
      }
      const data = snap.data() as { isOnline?: boolean };
      setIsOnline(Boolean(data.isOnline));
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const q = query(
      collection(firebaseDb, "sessions"),
      where("astroId", "==", user.firebaseUser.uid),
      where("startedAt", ">=", startOfDay),
      orderBy("startedAt", "desc"),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const rows: SessionRow[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<SessionRow, "id">),
      }));
      setSessions(rows);
    });

    return () => unsub();
  }, [user]);

  const handleToggleOnline = async () => {
    if (!user) return;
    const astroRef = doc(
      firebaseDb,
      "astrologers",
      user.firebaseUser.uid,
    );
    await setDoc(
      astroRef,
      {
        name:
          user.firebaseUser.displayName ??
          user.firebaseUser.email ??
          "Astrologer",
        isOnline: !isOnline,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    setIsOnline((prev) => !prev);
  };

  const todayCount = sessions.length;

  const upcomingSessions = useMemo(
    () => sessions.filter((s) => s.status !== "ended"),
    [sessions],
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-zinc-50">
        <p className="text-sm text-zinc-400">Loading your dashboard...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-zinc-50">
        <p className="text-sm text-zinc-400">
          Please sign in as an astrologer to access this dashboard.
        </p>
      </main>
    );
  }

  if (user.role !== "astrologer") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-zinc-50">
        <div className="text-center">
          <p className="text-sm text-zinc-400">
            Access Denied. You are signed in as a "{user.role}".
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/profile")}
          >
            Go to Profile
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black px-4 pb-16 pt-10 text-zinc-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              Astrologer dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Control your online status and see today&apos;s sessions.
            </p>
          </div>
          <Button
            variant={isOnline ? "outline" : "default"}
            size="sm"
            onClick={handleToggleOnline}
          >
            {isOnline ? "Go offline" : "Go online"}
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-400">
              Today&apos;s sessions
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {todayCount}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-400">Status</p>
            <p className="mt-2 text-2xl font-semibold">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-100">
              Today&apos;s sessions
            </h2>
            <p className="text-xs text-zinc-500">
              Live and recently completed
            </p>
          </div>

          {sessions.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-400">
              No sessions yet today. Switch to{" "}
              <span className="font-medium text-emerald-300">
                Online
              </span>{" "}
              to appear in the public list.
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2"
                >
                  <div>
                    <p className="text-xs text-zinc-400">
                      Session #{session.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-zinc-400">
                    <p className="font-medium text-zinc-100">
                      {session.status === "ended"
                        ? "Completed"
                        : "In progress"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {upcomingSessions.length > 0 && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <h2 className="text-sm font-medium text-zinc-100">
              Active sessions
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Keep this tab open while you take calls.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

