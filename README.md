# Smart University System

A full-stack example project implementing a collection of university services (auth, canteen, library, shuttle, facilities and more). This repository contains a Node/Express + MongoDB backend and a React/Vite frontend.

## Highlights
- Modular backend with routes/controllers for Auth, Canteen, Library, Shuttle, Orders and Facilities
- React + Vite frontend with modern UI libraries and Playwright tests scaffolded
- Database seeding utilities and documentation for development convenience

## Quick status
- Backend: Node.js + Express, MongoDB (Mongoose)
- Frontend: React (Vite)

## Table of contents
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Setup & run (backend)](#setup--run-backend)
- [Setup & run (frontend)](#setup--run-frontend)
- [Database seeding](#database-seeding)
- [Project structure & notes](#project-structure--notes)
- [Testing](#testing)
- [Contributing](#contributing)
- [License & contact](#license--contact)

## Prerequisites
- Node.js (v16+ recommended)
- npm (comes with Node)
- MongoDB (Atlas or local)

## Environment variables
Create a `.env` file in the `backend/` folder (copy from any `.env.example` if present). Common env vars used by the backend (`backend/server.js`) include:

- `MONGO_URI` — primary MongoDB connection string (Atlas or other)
- `LOCAL_MONGO_URI` — optional local fallback connection (example: `mongodb://127.0.0.1:27017/uni-system`)
- `FALLBACK_TO_LOCAL` — set to `true` to allow fallback to local DB in development
- `PORT` — backend port (default 5000)
- `CLIENT_ORIGIN` — comma-separated allowed client origins (e.g. `http://localhost:5173`)
- `BODY_LIMIT` — request body size limit (e.g. `10mb`)
- `NODE_ENV` — `development` / `production`

## Setup & run (backend)
1. Open a terminal and install dependencies:

```powershell
cd backend
npm install
```

2. Add `.env` with the variables above.

3. Start the server (development with auto-reload):

```powershell
npm run dev   # uses nodemon (if installed) to restart on changes
```

Or start in production mode:

```powershell
npm start
```

4. Seed the database (optional, helpful for development):

```powershell
npm run seed
```

The backend exposes routes under `/api/*` (see `backend/server.js`). Example: `GET /` responds with `API is running...`.

## Setup & run (frontend)
1. Install frontend dependencies and start the dev server:

```powershell
cd frontend
npm install
npm run dev
```

2. The frontend runs with Vite (default port 5173). Ensure `CLIENT_ORIGIN` in the backend `.env` includes the frontend origin.

## Database seeding
There is a dedicated `SEEDING_GUIDE.md` explaining multiple seeding options (manual insert, programmatic seed script). The backend `package.json` includes a `seed` script (`node seed.js`). For simple canteen admin seeding there are examples in the seeding guide.

## Project structure (top-level)
- `backend/` - Node/Express server, routes, controllers, models, `server.js`, `seed.js`
- `frontend/` - React (Vite) app, components, assets
- `SEEDING_GUIDE.md`, `SETUP_GUIDE.md`, `ARCHITECTURE.md`, `IMPLEMENTATION_SUMMARY.md` - project docs

## Notes / Implementation details
- Backend uses environment-first pattern: `dotenv.config()` is loaded early in `server.js` so routes and other modules can safely read env vars.
- `server.js` includes a graceful fallback connection strategy: it tries `MONGO_URI` and will optionally fallback to a local MongoDB when `FALLBACK_TO_LOCAL=true` (development).
- Frontend dependencies include React, react-router, axios, and three.js related libs; dev tooling includes ESLint, Tailwind/PostCSS, Playwright for e2e tests.

## Testing
- Frontend Playwright tests can be run from the `frontend/` folder if Playwright tests exist:

```powershell
cd frontend
npm run test:e2e
```

## Contributing
- Please open issues or PRs for fixes and improvements. Follow existing code style and keep changes small and focused.

Suggested follow-ups:
- Add a `backend/.env.example` with required variables and example values
- Add a brief CONTRIBUTING.md with branch/pr guidelines
- Add CI checks (lint, tests) and badges to the README

## License & contact
This repository does not include an explicit license file. Add a `LICENSE` if you plan to change the license.

For questions or help, inspect the `backend/` and `frontend/` folders and open an issue in this repository.

---
Generated/updated README to provide clear setup/run instructions and link to existing docs (seeding, setup, architecture).