# MiniStatus

A minimal infrastructure status page: a public status page plus an admin dashboard for managing services and incidents. Built to be simple today and easy to containerize / deploy on Kubernetes later (no Kubernetes, Docker, or CI config is included in this phase).

## Architecture

```text
Browser
   |
   v
Frontend (React + Vite, static assets)
   |  HTTP (VITE_API_URL)
   v
Backend API (Node.js + Express)
   |  Prisma
   v
PostgreSQL
```

No microservices — one frontend, one backend API, one database.

## Tech stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, TypeScript, Express
- **Database**: PostgreSQL
- **ORM**: Prisma

## Project structure

```text
ministatus/
├── frontend/          React + Vite app (public status page + admin dashboard)
│   ├── src/
│   │   ├── pages/          StatusPage.tsx, admin/*
│   │   ├── components/     StatusBadge.tsx
│   │   ├── lib/api.ts      fetch client (VITE_API_URL)
│   │   └── types/          shared TS types
│   └── .env.example
│
├── backend/            Express + Prisma API
│   ├── src/
│   │   ├── routes/         services.ts, incidents.ts, system.ts
│   │   ├── controllers/    thin HTTP handlers
│   │   ├── services/       business logic + Prisma calls
│   │   ├── middleware/     logger.ts, errorHandler.ts
│   │   ├── lib/prisma.ts   Prisma client singleton
│   │   ├── app.ts          Express app factory (used by tests too)
│   │   └── index.ts        server entrypoint + graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── .env.example
│
├── README.md
├── .gitignore
└── .env.example
```

## Requirements

- Node.js 20+
- PostgreSQL 14+
- npm

## Setup

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` and point `DATABASE_URL` at your PostgreSQL instance, e.g.:

```text
DATABASE_URL="postgresql://ministatus:ministatus@localhost:5432/ministatus?schema=public"
```

`frontend/.env` just needs `VITE_API_URL` pointing at the backend (default `http://localhost:3000`).

## Database

From `backend/`:

```bash
npx prisma migrate dev --name init   # creates tables
npx prisma db seed                   # seeds Website, API, Database, Kubernetes + sample incidents
```

## Development

Backend (from `backend/`):

```bash
npm run dev      # http://localhost:3000
```

Frontend (from `frontend/`):

```bash
npm run dev      # http://localhost:5173
```

Visit `http://localhost:5173/` for the public status page and `http://localhost:5173/admin` for the admin dashboard.

## API

```text
GET    /api/health              liveness probe, always 200 if process is up
GET    /api/ready                readiness probe, checks PostgreSQL connectivity
GET    /api/runtime               app/version/host/node/uptime info

GET    /api/services              list services
GET    /api/services/:id          get one service
POST   /api/services              create a service
PATCH  /api/services/:id          update a service (status, description, uptime, enabled, ...)
DELETE /api/services/:id          delete a service

GET    /api/incidents             list incidents
GET    /api/incidents/:id         get one incident
POST   /api/incidents             create an incident
PATCH  /api/incidents/:id         update an incident (status transitions to RESOLVED auto-stamp resolvedAt)
DELETE /api/incidents/:id         delete an incident
```

All errors are returned as:

```json
{ "error": { "code": "SERVICE_NOT_FOUND", "message": "Service not found" } }
```

## Health check

- `GET /api/health` — is the process alive? No dependencies checked. Intended for a future Kubernetes `livenessProbe`.
- `GET /api/ready` — is the app ready to serve traffic? Runs `SELECT 1` against PostgreSQL; returns `503` with `{"status":"not_ready","database":"disconnected"}` if the database is unreachable. Intended for a future Kubernetes `readinessProbe`.

## Database schema

**Service**: `id, name, description, status (OPERATIONAL | DEGRADED | PARTIAL_OUTAGE | MAJOR_OUTAGE), uptime, enabled, createdAt, updatedAt`

**Incident**: `id, title, description, severity (LOW | MEDIUM | HIGH | CRITICAL), status (INVESTIGATING | IDENTIFIED | MONITORING | RESOLVED), createdAt, updatedAt, resolvedAt`

## Environment variables

Backend (`backend/.env`):

```text
DATABASE_URL   PostgreSQL connection string (required)
PORT           HTTP port (default 3000)
NODE_ENV       development | production | test
APP_VERSION    surfaced by GET /api/runtime; set to image tag/git SHA in real deploys
CORS_ORIGIN    allowed browser origin (default *)
```

Frontend (`frontend/.env`):

```text
VITE_API_URL   base URL of the backend API (default http://localhost:3000)
```

## How to run tests

From `backend/`:

```bash
npm test
```

Tests cover `/api/health`, `/api/ready`, `/api/runtime`, and CRUD flows for services and incidents. The CRUD tests need a reachable `DATABASE_URL` (point it at a disposable/test database).

## Key technical decisions

- **Layered backend**: routes → controllers (thin HTTP glue) → services (business logic + Prisma). Keeps handlers testable and logic reusable.
- **Single Prisma client instance** (`src/lib/prisma.ts`), reused across the app instead of instantiated per request/module.
- **Centralized error handling** via a custom `ApiError` class and one Express error-handling middleware, so every error returns the same `{ error: { code, message } }` shape and stack traces never leak in production.
- **Structured JSON request logs** written to stdout only (no file logging), since a container runtime/Kubernetes is expected to collect stdout/stderr later.
- **Graceful shutdown**: on `SIGTERM`/`SIGINT` the HTTP server stops accepting new connections, in-flight requests finish, the Prisma connection is closed, then the process exits — important for clean Kubernetes rolling updates.
- **No hard-coded config**: DB credentials, port, app version, CORS origin, and the frontend's API URL are all environment variables, so the same build/image can move between environments.
- **`resolvedAt` auto-management**: updating an incident's status to `RESOLVED` stamps `resolvedAt`; moving it back to a non-resolved status clears it — kept in the service layer, not the frontend, so it's consistent regardless of client.

## What's already prepared for a future Kubernetes deployment

- `/api/health` and `/api/ready` are split (liveness vs. readiness) and ready to wire into `livenessProbe`/`readinessProbe`.
- `/api/runtime` exposes hostname, Node version, platform, uptime, and an env-configurable `APP_VERSION` — useful for confirming which pod/replica/version you're hitting during a rollout.
- All config (DB URL, port, version, CORS origin, frontend API URL) is environment-variable driven, matching how ConfigMaps/Secrets would be injected.
- Graceful shutdown on `SIGTERM` matches how Kubernetes terminates pods during rolling updates/scaling.
- Logs go only to stdout/stderr, matching how container log collection works.
- Frontend and backend are fully decoupled (separate processes/ports, no server-side rendering coupling), so they can become two separate Deployments/Services later.

Explicitly **not** included yet (by design, for a later phase): Dockerfiles, Docker Compose, Kubernetes manifests, Helm/Kustomize, ArgoCD, CI/CD pipelines, reverse proxy config, monitoring stack, and complex auth.

