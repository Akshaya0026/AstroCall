"use client";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
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
  endedAt?: { seconds: number; nanoseconds: number };
  astroId: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(firebaseDb, "sessions"),
      where("userId", "==", user.firebaseUser.uid),
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

  const totalMinutes = useMemo(() => {
    return sessions.reduce((acc, session) => {
      if (!session.startedAt || !session.endedAt) return acc;
      const start = session.startedAt.seconds * 1000;
      const end = session.endedAt.seconds * 1000;
      const minutes = Math.max(0, end - start) / 1000 / 60;
      return acc + minutes;
    }, 0);
  }, [sessions]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-zinc-50">
        <p className="text-sm text-zinc-400">Please sign in first.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black px-4 pb-16 pt-10 text-zinc-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Your dashboard</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Review your past calls and total guidance time.
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
              onClick={() => window.location.assign("/astrologers")}
            >
              Start new call
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-400">Total sessions</p>
            <p className="mt-2 text-2xl font-semibold">
              {sessions.length}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-400">Guidance minutes</p>
            <p className="mt-2 text-2xl font-semibold">
              {Math.round(totalMinutes)}
            </p>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-100">
              Recent calls
            </h2>
            <p className="text-xs text-zinc-500">
              Most recent {sessions.length > 5 ? 5 : sessions.length}{" "}
              sessions
            </p>
          </div>

          {sessions.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-400">
              You haven&apos;t completed any sessions yet. Once you end
              a call, it will appear here with its duration.
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {sessions.slice(0, 5).map((session) => {
                const start = session.startedAt
                  ? new Date(session.startedAt.seconds * 1000)
                  : null;
                const end = session.endedAt
                  ? new Date(session.endedAt.seconds * 1000)
                  : null;
                const minutes =
                  start && end
                    ? Math.round(
                      (end.getTime() - start.getTime()) / 1000 / 60,
                    )
                    : null;

                return (
                  <li
                    key={session.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2"
                  >
                    <div>
                      <p className="text-xs text-zinc-400">
                        Session #{session.id.slice(0, 8)}
                      </p>
                      {start && (
                        <p className="text-xs text-zinc-500">
                          {start.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-zinc-400">
                      <p className="font-medium text-zinc-100">
                        {session.status === "ended"
                          ? "Completed"
                          : "In progress"}
                      </p>
                      {minutes != null && (
                        <p>{minutes} min</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

