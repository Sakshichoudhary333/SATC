# SATC

SATC is a full-stack truck management system with a Node.js/Express backend and a React/Vite frontend. It supports order management, truck and trip tracking, billing, maintenance, reviews, OTP-based flows, admin dashboards, and live updates through Socket.IO.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO
- Frontend: React 19, Vite, React Router, Axios, Leaflet, Socket.IO Client
- Testing: Jest, Supertest, Puppeteer

## Project Structure

- `backend/` - API server, database models, controllers, routes, sockets, utilities, and tests
- `frontend/` - React client, pages, components, styles, and tests
- `frontend/README.md` - frontend-specific production API configuration note

## Features

- Authentication and role-based access
- Order, truck, trip, billing, expense, maintenance, and review management
- Admin dashboards and reporting
- OTP handling and email support
- Live truck tracking and real-time updates
- Validation, rate limiting, request logging, and basic security headers

## Prerequisites

- Node.js 18+ recommended
- npm
- MongoDB connection string

## Setup

1. Install dependencies for both apps:

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Configure environment variables.

### Backend

Copy `backend/.env.example` to `backend/.env` and set values such as:

- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `PORT`
- `EMAIL_USER`
- `EMAIL_PASS`

Example:

```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/satc
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173
JSON_BODY_LIMIT=1mb
GLOBAL_RATE_LIMIT_WINDOW_MS=900000
GLOBAL_RATE_LIMIT_MAX=2000
SLOW_REQUEST_MS=1000
LOG_HTTP_BODIES=false
EMAIL_USER=
EMAIL_PASS=
```

### Frontend

Copy `frontend/.env.example` to `frontend/.env` and set:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

If you deploy the frontend separately, point `VITE_API_BASE_URL` at your live API.

## Running Locally

### Backend

```bash
cd backend
npm run dev
```

The backend starts with Nodemon for development.

Production start:

```bash
npm start
```

### Frontend

```bash
cd frontend
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Testing

### Backend

```bash
cd backend
npm test
npm run test:watch
npm run test:coverage
```

### Frontend

```bash
cd frontend
npm test
npm run test:e2e
```

## Available Scripts

### Backend

- `npm start` - start the API server
- `npm run dev` - start the API server with Nodemon
- `npm test` - run Jest tests
- `npm run test:watch` - run Jest in watch mode
- `npm run test:coverage` - run coverage report

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - create production bundle
- `npm run preview` - preview production build
- `npm run lint` - run ESLint
- `npm test` - run Jest tests
- `npm run test:e2e` - run verbose Jest-based end-to-end checks

## Backend Notes

- The API exposes a `/healthz` endpoint for health checks.
- Socket.IO is initialized from the backend server.
- MongoDB connection is handled in `backend/config/db.js`.
- Email transport is initialized on startup when credentials are available.

## Frontend Notes

- The app defaults to `http://localhost:5001/api` when `VITE_API_BASE_URL` is not set.
- The frontend includes routing, public pages, dashboards, and map-based tracking views.

## License

ISC, as defined in the backend package metadata.
