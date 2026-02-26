require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/token", async (req, res) => {
    try {
        const { room, identity } = req.body;

        if (!room) {
            return res.status(400).json({ error: "room is required" });
        }

        const participantIdentity = identity || `user_${Math.floor(Math.random() * 10000)}`;
        const apiKey = (process.env.LK_API_KEY || "").trim();
        const apiSecret = (process.env.LK_API_SECRET || "").trim();

        console.log("--- Generating Token (Async) ---");
        console.log(`Room: ${room}`);
        console.log(`Identity: ${participantIdentity}`);

        const at = new AccessToken(apiKey, apiSecret);

        at.identity = participantIdentity;
        at.name = participantIdentity;
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
    console.log(`LiveKit Token Server Running on ${PORT}`)
);
