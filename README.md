# KanbanSync: Real-Time Collaborative Kanban Board

KanbanSync is a production-level, real-time collaborative Kanban board (similar to Trello) built using the MERN (MongoDB, Express, React, Node) stack. It incorporates WebSockets (Socket.io) for live synchronization of tasks, online member indicators, real-time editing banners, fractional indexing for seamless reordering, and productivity analytics.

---

## Key Features

1. **Real-time Live Collaboration**:
   - Updates to tasks (moves, edits, comments, attachments) sync instantly across all members' screens using Socket.io room broadcasts.
   - Dynamic user online status indicators with real-time green halos.
   - Instant user typing indicators ("*User A is editing description...*") when modifying task details.

2. **Drag & Drop Task Sorting**:
   - Powered by **Dnd Kit** (React Dnd) supporting smooth, pointer-sensor-activation-constrained drag-and-drop operations within and across columns.
   - **Fractional Indexing Algorithm**: Re-orders tasks locally and database-side with float values, avoiding heavy database sequence rewires.
   - **Optimistic Rendering & Rollback**: Moves reflect on the screen instantly; if the database update fails, state rolls back gracefully.

3. **Conflict Resolution & LWW (Last-Write-Wins)**:
   - Prevents stale state overwriting using a task schema versioning check. If an out-of-date modification is submitted, the backend rejects it with a `409 Conflict` status, causing the client to roll back and flash an alert.

4. **Rich Task Detail Modals**:
   - Inline edits for Title, Description, Priority (`low` / `medium` / `high`), and Due Date.
   - Multi-format attachment file uploads utilizing a **Dual Storage Engine**: stores files locally in `/uploads` by default, or seamlessly transitions to **Cloudinary** if keys are configured.
   - Inline commenting with author details and creation timestamps.
   - Complete task activity logs tracking creation, description changes, movements, assignees, comment posts, and uploads.

5. **Analytical Dashboard Panel**:
   - Visual charts & statistics displaying total task count, completions, and priority distribution.
   - Team member productivity metrics (completed vs assigned ratios) to track efficiency.
   - Unified board-wide activity logs chronological timeline.

---

## Technology Stack

### Frontend
- **Framework**: React.js 19 + Vite
- **Styling**: Tailwind CSS (sleek dark mode and translucent glassmorphism)
- **State Management**: Redux Toolkit (RTK) + RTK Query (auto-caching and manual socket cache updates)
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Validation**: React Hook Form + Zod

### Backend
- **Platform**: Node.js + Express
- **Database**: MongoDB (via Mongoose)
- **Real-Time Integration**: Socket.io (with handshake token validation)
- **Authentication**: JSON Web Tokens (JWT) + BcryptJS encryption
- **File Uploads**: Multer + Local Disk / Cloudinary CDN

---

## Directory Structure

```text
kanban/
├── backend/            # Express.js REST API & Socket.io server
│   ├── src/
│   │   ├── config/     # Mongo & Cloudinary setup
│   │   ├── controllers/# Routes controller methods
│   │   ├── middlewares/# Auth, error handling, upload, and schemas validators
│   │   ├── models/     # User, Board, and Task Mongoose models
│   │   ├── routes/     # Express REST endpoints definition
│   │   ├── services/   # Socket.io connection logic and uploads handling
│   │   └── server.js   # Server Entrypoint
│   └── package.json
│
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # React reusable UI blocks (Auth, Boards, Common Layouts)
│   │   ├── context/    # Socket.io connection context
│   │   ├── hooks/      # useSocket hook
│   │   ├── store/      # Redux store, RTK Query API, and slices
│   │   ├── utils/      # Fractional Indexing algorithms
│   │   └── main.jsx    # Application Entrypoint
│   └── package.json
```

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (running locally on default port `27017` or a MongoDB Atlas URI)

### 1. Configure the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` file:
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and set your local MongoDB connection string or Atlas URL. Keep the Cloudinary fields blank to use local storage uploads.*

4. Start the backend in development mode:
   ```bash
   npm run dev
   ```
   *The server starts on `http://localhost:5000`.*

### 2. Configure the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
   *(We use `--legacy-peer-deps` to bypass React 19 peer constraints on Dnd Kit libraries).*

3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *Vite starts the client server on `http://localhost:3000`.*

---

## How to Test Collaborative Boards

1. Open your browser and navigate to `http://localhost:3000`.
2. Register a new user account (e.g., User A).
3. Log in, click **Create Board**, name it, and enter the board workspace.
4. Click the invite member icon (`+` next to member avatars) and enter the email of a second user (e.g., User B) whom you wish to add.
5. Open an **Incognito Window** (or a different browser session), navigate to `http://localhost:3000`, register as User B, and log in.
6. User B will see the shared board under their workspace. Click to enter.
7. Observe:
   - Green online indicator glows beside the active avatars in the header.
   - Create a task or drag a task card to another column: it reflects immediately in both windows with smooth transitions.
   - Open a task detail modal in User A's browser and start typing in the Description: User B's browser displays a blinking status indicator stating "*User A is editing...*".
