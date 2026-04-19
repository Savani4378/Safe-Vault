# VaultGuard Secure Vault System

VaultGuard is a professional secure vault manager built with an Express backend and React frontend. It encrypts your files and folders into secure AES-256 containers and ensures privacy utilizing PIN hashes (Argon2) and optional stealth mode.

## Architecture & Stack

- **Frontend:** React 19 (Vite), Zustand, TailwindCSS
- **Backend:** Node.js, Express, AdmZip, Crypto
- **Encryption:** AES-256-GCM
- **Database:** Local JSON fallback (`data/db.json`) implemented and active. A `schema.sql` file is included for scaling up to PostgreSQL when required.

## Installation and Run Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Install Dependencies

You can install all dependencies from the root directory:

```bash
npm install
```

### 2. Start Application

The project is structured as a full-stack monolithic structure using Vite's middleware inside an Express Node process.

**Start for Development (Typescript / Hot Reload)**:

```bash
npm run dev
```
(This will run `tsx server.ts` and set up the Vite router and API endpoints simultaneously locally on http://localhost:3000)

**Build and Start for Production**:

```bash
npm run build
npm start
```
(This will build the static frontend to `/dist` and run `node server.ts` to statically serve the Vue app alongside the Backend APIs).

### 3. Packaging as Desktop Application (Electron)

To wrap VaultGuard as a standalone desktop vault manager:
1. Initialize an Electron project.
2. Build the app utilizing `npm run build`.
3. Inside your `main.js` Electron entry point, fork the Express `server.ts` process.
4. Load `http://localhost:3000` via `win.loadURL()` to render the dashboard!

## Security Protocols Implemented
- **Argon2** for Key Derivation and PIN Hashing.
- **AES-256-GCM** for Cryptographic Container Sealing.
- **Biometric Hooks** for WebAuthn integrations.
- **Plausible Deniability** hidden vault mode with separate encryption salts and container extension masquerading.
- **Local DB Segregation**: Plain-text keys are never stored; only Argon2 hashes are.
- **Auto Lock**: Frontend timer listens to user interactions and locks session after designated timeout.
