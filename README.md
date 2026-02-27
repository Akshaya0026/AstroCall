# AstroCall v1 🌌

Consult the heavens with India's most trusted astrologers through secure, high-definition video sessions. AstroCall is a premium, secure platform built for seamless celestial guidance, combining modern web aesthetics with robust security.

## Recent Core Improvements

### 1. Unified Astrologer Onboarding
- **Role Selection**: Integrated role selection (User vs. Astrologer) directly into the premium login flow.
- **Automated Provisioning**: New astrologers automatically receive a pre-configured professional profile document in Firestore.
- **Dedicated Dashboards**: Automatic redirection to specialized dashboards based on authenticated roles.

### 2. Security Hardening & Zero-Trust Architecture
- **Authenticated Token Server**: The LiveKit token generation server now validates Firebase ID tokens and verifies session membership before granting access.
- **Secure Firestore Rules**: Implementation of granular, role-based access control (RBAC). Direct modification of sensitive fields like `role` is blocked at the database level.
- **Membership Validation**: Cross-verification of session participants on both frontend and backend to prevent unauthorized access to private rooms.
- **Session Lifecycle**: Enhanced session management (Pending -> Active -> Ended) ensures tokens are only issued for valid, authorized windows.

## Visual Tour

| Premium Login | Astrologer Directory |
| :---: | :---: |
| ![Login](./docs/assets/login.png) | ![Astrologers](./docs/assets/astrologers.png) |

| User Profile | Astrologer Dashboard |
| :---: | :---: |
| ![Profile](./docs/assets/profile.png) | ![Dashboard](./docs/assets/dashboard.png) |

## Key Features
- **Crystal Clear Video**: High-definition video and voice consultation powered by LiveKit.
- **Glassmorphic Design**: A stunning, premium UI with smooth animations and dynamic hover states.
- **Real-time Availability**: Instant feedback on which astrologers are online and ready to consult.
- **In-depth Reviews**: Verified rating system for seekers to share their consultation experiences.

## Architecture & Tech Stack
- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), [Lucide](https://lucide.dev/).
- **Real-time Comms**: [LiveKit Cloud](https://livekit.io/) & [LiveKit Components](https://docs.livekit.io/components/react/).
- **Backend/Database**: [Firebase Auth](https://firebase.google.com/products/auth) & [Cloud Firestore](https://firebase.google.com/products/firestore).
- **Environment**: Container-ready structure with clean dependency separation.

## Role-Based Workflows

### For Seekers (Users)
1. **Browse**: Explore the galaxy of online astrologers.
2. **Consult**: Start an instant session with a secure, private room.
3. **Reflect**: Manage consultation history and leave ratings from a personalized dashboard.

### For Astrologers
1. **Presence**: Control your visibility with a simple "Go Online" toggle.
2. **Dashboard**: Manage incoming consultation requests and track today's engagement.
3. **Profile**: Update professional bio, languages, and expertise directly from your dashboard.

## Local Setup & Development

### 1. Prerequisites
- **Node.js**: 18.x or higher
- **Firebase CLI**: `npm install -g firebase-tools`

### 2. Start LiveKit Token Server
The token server handles authenticated requests to join video rooms.
```bash
cd livekit-server
npm install
node server.js
```
*Port: 5005 (Requires `.env` with LK_API_KEY, LK_API_SECRET, and Firebase Emulator hosts)*

### 3. Start Firebase Emulators
We use local emulators for a leak-proof development cycle.
```bash
# From the project root
firebase emulators:start
```
*UI: http://localhost:4000*

### 4. Run the Next.js App
```bash
cd astrocall-web
npm install
npm run dev
```
*UI: http://localhost:3000*

## Local Test Credentials
| Account Type | Email | Password |
| :--- | :--- | :--- |
| **Astrologer** | `test-astro@example.com` | `password` |
| **User** | `test-user@example.com` | `password` |

---

