import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { AccessToken } from "livekit-server-sdk";

if (!admin.apps.length) {
  admin.initializeApp();
}

const LK_API_KEY = process.env.LK_API_KEY;
const LK_API_SECRET = process.env.LK_API_SECRET;
const LK_WS_URL = process.env.LK_WS_URL;

if (!LK_API_KEY || !LK_API_SECRET || !LK_WS_URL) {
  // Functions will still deploy, but calls will fail until env is set.
  // This ensures misconfiguration is obvious in logs.
  console.warn(
    "LiveKit env vars (LK_API_KEY, LK_API_SECRET, LK_WS_URL) are not fully set.",
  );
}

export const createRoomToken = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in to request a token.",
      );
    }

    const sessionId = data.sessionId as string | undefined;
    const identity = data.identity as string | undefined;

    if (!sessionId || !identity) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "sessionId and identity are required.",
      );
    }

    if (!LK_API_KEY || !LK_API_SECRET || !LK_WS_URL) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "LiveKit env vars are not configured.",
      );
    }

    const token = new AccessToken(LK_API_KEY, LK_API_SECRET, {
      identity,
    });

    token.addGrant({
      room: sessionId,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    return {
      token: jwt,
      wsUrl: LK_WS_URL,
    };
  },
);

