import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getFunctions,
  connectFunctionsEmulator,
  type Functions,
} from "firebase/functions";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let functions: Functions;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

auth = getAuth(app);
db = getFirestore(app);
functions = getFunctions(app);

if (process.env.NODE_ENV === "development") {
  const g = global as any;
  if (typeof window !== "undefined" && !g._firebase_emulators_connected) {
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "localhost", 8080);
    connectFunctionsEmulator(functions, "localhost", 5001);
    g._firebase_emulators_connected = true;
  }
}

export const firebaseApp = app;
export const firebaseAuth = auth;
export const firebaseDb = db;
export const firebaseFunctions = functions;
export const googleProvider = new GoogleAuthProvider();

