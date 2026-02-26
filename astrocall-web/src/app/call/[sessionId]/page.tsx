"use client";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
  ControlBar,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../context/AuthContext";
import {
  firebaseDb,
  firebaseFunctions,
} from "../../../lib/firebase";

interface Session {
  userId: string;
  astroId: string;
  status: "active" | "ended";
  startedAt?: { seconds: number; nanoseconds: number };
  endedAt?: { seconds: number; nanoseconds: number };
}

interface CreateRoomTokenResponse {
  token: string;
  wsUrl: string;
}

export default function CallPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    const sessionRef = doc(firebaseDb, "sessions", sessionId);

    const unsub = onSnapshot(sessionRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as Session;
      setSession(data);
      if (data.status === "ended") {
        setShowRating(true);
      }
    });

    return () => unsub();
  }, [sessionId, user]);

  useEffect(() => {
    if (!user || !sessionId) return;

    const fetchToken = async () => {
      // First check if session is already ended
      const sessionRef = doc(firebaseDb, "sessions", sessionId);
      const snap = await getDoc(sessionRef);
      if (snap.exists()) {
        const sessionData = snap.data() as Session;
        if (sessionData.status === "ended") {
          console.log("Session already ended, blocking connection.");
          setLoadingToken(false);
          setShowRating(true);
          return;
        }
      }

      setLoadingToken(true);
      try {
        const res = await fetch("http://localhost:5005/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: sessionId,
            identity: user.firebaseUser.uid,
          }),
        });

        if (!res.ok) {
          console.error("Token server response NOT OK:", res.status, res.statusText);
          throw new Error("Failed to fetch LiveKit token");
        }

        const data = await res.json() as CreateRoomTokenResponse;
        console.log("Fetched token successfully. WS URL:", data.wsUrl);

        setToken(data.token);
        setWsUrl(data.wsUrl);

        if (snap.exists()) {
          const sessionData = snap.data() as Session;
          if (!sessionData.startedAt) {
            await updateDoc(sessionRef, {
              status: "active",
              startedAt: serverTimestamp(),
            });
          }
        }
      } catch (err) {
        console.error("Error fetching LiveKit token:", err);
      } finally {
        setLoadingToken(false);
      }
    };

    fetchToken();
  }, [sessionId, user]);

  const startedAtDate = useMemo(() => {
    if (!session?.startedAt) return null;
    return new Date(session.startedAt.seconds * 1000);
  }, [session?.startedAt]);

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAtDate) return;

    const interval = setInterval(() => {
      setElapsed(Date.now() - startedAtDate.getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAtDate]);

  const formattedElapsed = useMemo(() => {
    const totalSeconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [elapsed]);

  const handleEndCall = async () => {
    const sessionRef = doc(firebaseDb, "sessions", sessionId);
    await updateDoc(sessionRef, {
      status: "ended",
      endedAt: serverTimestamp(),
    });
    setShowRating(true);
  };

  const handleSubmitReview = async () => {
    if (!session || rating == null || !user) return;
    const reviewsCol = collection(firebaseDb, "reviews");

    await setDoc(doc(reviewsCol), {
      sessionId,
      userId: session.userId,
      astroId: session.astroId,
      rating,
      comment,
      createdAt: serverTimestamp(),
    });

    setShowRating(false);
    router.push("/dashboard");
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-zinc-50">
        <p className="text-sm text-zinc-400">
          Please sign in to join this call.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-black text-zinc-50">
      <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3 text-xs text-zinc-400">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-amber-200">
            Live session
          </p>
          <p className="mt-1 text-sm text-zinc-100">
            Session #{sessionId.slice(0, 8)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-200">
            {formattedElapsed}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleEndCall}
          >
            Leave room
          </Button>
        </div>
      </div>

      <div className="flex-1">
        {!isMounted || loadingToken || !token || !wsUrl || session?.status === "ended" ? (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-zinc-950 to-black text-sm text-zinc-400">
            {session?.status === "ended"
              ? "Session has ended."
              : loadingToken ? "Connecting to LiveKit..." : "Preparing room..."}
          </div>
        ) : (
          <LiveKitRoom
            token={token}
            serverUrl={wsUrl}
            connect
            video
            audio
            onDisconnected={() => {
              console.log("LiveKit disconnected from room:", sessionId);
              handleEndCall();
            }}
            onError={(err) => {
              console.error("LiveKit connection error:", err);
            }}
            data-lk-theme="default"
            style={{ height: "100%", width: "100%" }}
          >
            <MyVideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        )}
      </div>

      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-50">
              How was your session?
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Leave a quick rating to help others choose the right
              astrologer.
            </p>

            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={`flex-1 rounded-full border px-0 py-2 text-sm ${rating === value
                    ? "border-amber-400 bg-amber-400/10 text-amber-200"
                    : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700"
                    }`}
                >
                  {value}
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment..."
              className="mt-4 h-20 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRating(false)}
              >
                Skip
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitReview}
                disabled={rating == null}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 min-h-0">
        <GridLayout tracks={tracks}>
          <ParticipantTile />
        </GridLayout>
      </div>
      <div className="p-4 bg-zinc-950 border-t border-zinc-900">
        <ControlBar
          variation="minimal"
          controls={{
            microphone: true,
            camera: true,
            chat: false,
            screenShare: false,
            leave: false, // We use our own leave button in the header
          }}
        />
      </div>
    </div>
  );
}

