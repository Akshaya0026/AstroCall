"use client";

import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  firebaseAuth,
  firebaseDb,
  googleProvider,
} from "../lib/firebase";

type Role = "user" | "astrologer" | "admin" | null;

export interface AppUser {
  firebaseUser: User;
  role: Role;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: (role?: Role) => Promise<void>;
  signInWithEmail: (email: string, pass: string, role?: Role) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      async (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const userRef = doc(firebaseDb, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          // Check for intended role in localStorage
          const intendedRole = localStorage.getItem("intended_role") as Role || "user";

          await setDoc(userRef, {
            role: intendedRole,
            createdAt: serverTimestamp(),
          });

          // If role is astrologer, create the astrologer profile document as well
          if (intendedRole === "astrologer") {
            const astroRef = doc(firebaseDb, "astrologers", firebaseUser.uid);
            await setDoc(astroRef, {
              name: firebaseUser.displayName || "New Astrologer",
              isOnline: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }, { merge: true });
          }

          setUser({ firebaseUser, role: intendedRole });
          localStorage.removeItem("intended_role");
        } else {
          const data = snap.data() as { role?: Role };
          setUser({
            firebaseUser,
            role: data.role ?? "user",
          });
        }

        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async (role: Role = "user") => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      if (role) localStorage.setItem("intended_role", role);
      await signInWithPopup(firebaseAuth, googleProvider);
    } catch (error: any) {
      if (error?.code === "auth/popup-blocked") {
        await signInWithRedirect(firebaseAuth, googleProvider);
      } else if (
        error?.code === "auth/cancelled-popup-request" ||
        error?.code === "auth/popup-closed-by-user"
      ) {
        console.warn("Sign-in popup was closed or cancelled.");
      } else {
        throw error;
      }
    } finally {
      setIsSigningIn(false);
    }
  }, [isSigningIn]);

  const signInWithEmail = useCallback(async (email: string, pass: string, role: Role = "user") => {
    if (role) localStorage.setItem("intended_role", role);
    await signInWithEmailAndPassword(firebaseAuth, email, pass);
  }, []);

  const logout = useCallback(async () => {
    await signOut(firebaseAuth);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signInWithEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

