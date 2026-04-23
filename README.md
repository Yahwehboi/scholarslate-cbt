# ScholarSlate CBT

ScholarSlate CBT is structured as an npm workspace monorepo with separate frontend and backend applications.

## Project Structure

- `frontend/`: React + TypeScript + Vite client
- `backend/`: Express + TypeScript + SQLite (Drizzle) API
- `PROJECT_EXECUTION_PLAN.md`: phase-by-phase implementation plan

## Dependency Strategy

This repo uses npm workspaces with a single root `node_modules` folder.

- Install once at project root.
- Dependencies are declared per workspace in `frontend/package.json` and `backend/package.json`.
- npm hoists shared dependencies to reduce duplicate installs.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Backend environment:

```bash
cp backend/.env.example backend/.env
```

Update `JWT_SECRET` before production use.

## Scripts (Run from Repository Root)

- Start frontend dev server:

```bash
npm run dev:frontend
```

- Start backend dev server:

```bash
npm run dev:backend
```

- Build frontend:

```bash
npm run build:frontend
```

- Build backend:

```bash
npm run build:backend
```

- Lint/check both workspaces:

```bash
npm run lint
```

## Phase 0 Status

Phase 0 backend foundations are implemented:

- Express app bootstrap
- Centralized config validation
- SQLite initialization and core tables
- JWT utility and auth middleware skeleton
- Error middleware and 404 handler
- Health endpoint: `GET /api/health`
