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
import { Edit2, Save, X, Sparkles, Languages, IndianRupee } from "lucide-react";

interface SessionRow {
  id: string;
  status: string;
  startedAt?: { seconds: number; nanoseconds: number };
  userId: string;
}

import RoleGuard from "../../components/RoleGuard";

export default function AstrologerDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    specialty: "",
    languages: "",
    price: "0"
  });

  useEffect(() => {
    if (!user) return;

    const astroRef = doc(firebaseDb, "astrologers", user.firebaseUser.uid);
    const unsub = onSnapshot(astroRef, (snap) => {
      if (!snap.exists()) {
        return;
      }
      const data = snap.data();
      setIsOnline(Boolean(data.isOnline));
      setProfileData({
        name: data.name || user.firebaseUser.displayName || "",
        specialty: data.specialty || "",
        languages: (data.languages || []).join(", "),
        price: String(data.price || 0)
      });
    });

    return () => unsub();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    const astroRef = doc(firebaseDb, "astrologers", user.firebaseUser.uid);
    await updateDoc(astroRef, {
      name: profileData.name,
      specialty: profileData.specialty,
      languages: profileData.languages.split(",").map(s => s.trim()),
      price: Number(profileData.price),
      updatedAt: serverTimestamp()
    });
    setIsEditing(false);
  };

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

  return (
    <RoleGuard allowedRole="astrologer">
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
            {/* Profile Quick Edit */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h2 className="font-semibold text-zinc-100">Professional Profile</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit2 className="h-3 w-3 mr-2" />}
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Display Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Specialty</label>
                    <input
                      type="text"
                      placeholder="e.g. Vedic Astrology"
                      value={profileData.specialty}
                      onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Languages (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Hindi, English"
                      value={profileData.languages}
                      onChange={(e) => setProfileData({ ...profileData, languages: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Price per Minute (₹)</label>
                    <input
                      type="number"
                      value={profileData.price}
                      onChange={(e) => setProfileData({ ...profileData, price: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                  <div className="col-span-2 pt-2">
                    <Button
                      className="w-full bg-amber-500 text-black hover:bg-amber-400 font-bold"
                      onClick={handleSaveProfile}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Professional Details
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Expertise</p>
                    <p className="text-sm text-zinc-300">{profileData.specialty || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Pricing</p>
                    <div className="flex items-center text-amber-500">
                      <IndianRupee className="h-3 w-3 mr-0.5" />
                      <p className="text-sm font-bold">{profileData.price}/min</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Known Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.languages.split(",").filter(Boolean).map((lang, idx) => (
                        <span key={idx} className="bg-zinc-800 px-2 py-0.5 rounded text-[10px] text-zinc-400 border border-zinc-700">
                          {lang.trim()}
                        </span>
                      )) || <p className="text-xs text-zinc-600 italic">No languages added</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
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
    </RoleGuard>
  );
}

