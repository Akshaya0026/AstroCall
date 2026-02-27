require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");
const admin = require("firebase-admin");

// Initialize Firebase Admin for Emulator
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "astrocall-b9014",
    });
}

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split("Bearer ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ error: "Unauthorized" });
    }
};

app.post("/token", authenticate, async (req, res) => {
    try {
        const { room } = req.body;
        const identity = req.user.uid;

        if (!room) {
            return res.status(400).json({ error: "room is required" });
        }

        // 1. Verify Session Membership & Status
        const sessionRef = db.collection("sessions").doc(room);
        const sessionSnap = await sessionRef.get();

        if (!sessionSnap.exists) {
            return res.status(404).json({ error: "Session not found" });
        }

        const sessionData = sessionSnap.data();

        // Check if user is participant
        if (sessionData.userId !== identity && sessionData.astroId !== identity) {
            console.warn(`Unauthorized access attempt by ${identity} to room ${room}`);
            return res.status(403).json({ error: "Forbidden: You are not a participant in this session" });
        }

        // Check if session has ended
        if (sessionData.status === "ended") {
            return res.status(403).json({ error: "Forbidden: This session has already ended" });
        }

        console.log("--- Generating Secure Token ---");
        console.log(`Room: ${room}`);
        console.log(`Identity: ${identity}`);

        const apiKey = (process.env.LK_API_KEY || "").trim();
        const apiSecret = (process.env.LK_API_SECRET || "").trim();

        const at = new AccessToken(apiKey, apiSecret);

        at.identity = identity;
        at.name = req.user.name || identity;
        at.ttl = '2h';

        at.addGrant({
            roomJoin: true,
            room: room,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        const token = await at.toJwt();

        console.log("Token generated successfully");

        res.json({
            token,
            wsUrl: process.env.LK_WS_URL.trim(),
        });
    } catch (error) {
        console.error("Token generation failed:", error);
        res.status(500).json({ error: "Token generation failed" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Secure LiveKit Token Server Running on ${PORT}`)
);
