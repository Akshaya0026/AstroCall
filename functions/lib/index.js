"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoomToken = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const livekit_server_sdk_1 = require("livekit-server-sdk");
if (!admin.apps.length) {
    admin.initializeApp();
}
const LK_API_KEY = process.env.LK_API_KEY;
const LK_API_SECRET = process.env.LK_API_SECRET;
const LK_WS_URL = process.env.LK_WS_URL;
if (!LK_API_KEY || !LK_API_SECRET || !LK_WS_URL) {
    // Functions will still deploy, but calls will fail until env is set.
    // This ensures misconfiguration is obvious in logs.
    console.warn("LiveKit env vars (LK_API_KEY, LK_API_SECRET, LK_WS_URL) are not fully set.");
}
exports.createRoomToken = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be signed in to request a token.");
    }
    const sessionId = data.sessionId;
    const identity = data.identity;
    if (!sessionId || !identity) {
        throw new functions.https.HttpsError("invalid-argument", "sessionId and identity are required.");
    }
    if (!LK_API_KEY || !LK_API_SECRET || !LK_WS_URL) {
        throw new functions.https.HttpsError("failed-precondition", "LiveKit env vars are not configured.");
    }
    const token = new livekit_server_sdk_1.AccessToken(LK_API_KEY, LK_API_SECRET, {
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
});
