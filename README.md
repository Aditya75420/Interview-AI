# Interview AI

Full-stack web app that turns a **job description**, **resume (PDF)**, and optional **self-description** into an AI-generated interview preparation report. It uses **Google Gemini** for structured JSON output and **Puppeteer** to turn a tailored HTML resume into a downloadable PDF.

The repository splits into a **Node.js / Express** API (`Backend`, npm package name `yt-genai`) and a **React (Vite)** SPA (`Frontend`).

## Features

- **User accounts**: Register and login with username, email, and password; JWT stored in an **httpOnly cookie** (sent with `credentials: true` from the client).
- **Logout with token blacklist**: Logged-out tokens are stored in MongoDB so they cannot be reused.
- **Interview report generation**: Upload inputs → PDF text extraction (`pdf-parse`) → Gemini **2.5 Flash** returns JSON matching a Zod schema: match score, technical/behavioral Q&A (intention + model answer), skill gaps, multi-day preparation plan, job title.
- **Report history**: List recent plans (summary fields only) and open a full report by ID.
- **Tailored resume PDF**: For a saved report, Gemini outputs HTML; the server renders it to PDF with Puppeteer and streams the file for download.

## Tech stack

| Area | Technologies |
|------|----------------|
| Frontend | React 19, React Router 7, Vite 7, Axios, Sass |
| Backend | Express 5, Mongoose 9, Multer (memory, 3 MB limit), Zod + zod-to-json-schema |
| AI & PDF | `@google/genai`, Puppeteer |
| Data | MongoDB |

## Prerequisites

- **Node.js** (versions aligned with the lockfiles in each app)
- **MongoDB** (local or Atlas) and a connection string
- **Google AI API key** with access to the Gemini model used in code (`gemini-2.5-flash`)
- **Chromium**: Puppeteer installs a compatible browser; on some Linux setups you may need extra OS libraries—see [Puppeteer documentation](https://pptr.dev/).

## Project structure

```
interview-ai-yt-main/
├── Backend/
│   ├── server.js              # Entry: dotenv, DB connect, listen on 3000
│   └── src/
│       ├── app.js             # Express app, CORS (localhost:5173), routes
│       ├── config/database.js
│       ├── controllers/
│       ├── middlewares/       # JWT auth, Multer upload
│       ├── models/            # User, InterviewReport, token blacklist
│       ├── routes/
│       └── services/ai.service.js
└── Frontend/
    └── src/
        ├── app.routes.jsx
        ├── features/
        │   ├── auth/          # Login, Register, Protected, auth API
        │   └── interview/     # Home, Interview detail, interview API
        └── ...
```

## Environment variables

Create `Backend/.env` (never commit real secrets):

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `GOOGLE_GENAI_API_KEY` | Google Generative AI API key |

The frontend calls `http://localhost:3000` with credentials; the backend CORS origin is set to `http://localhost:5173`. Change both if you deploy or use another dev port.

## Setup and run

### 1. Backend

```bash
cd Backend
npm install
# Create .env with MONGO_URI, JWT_SECRET, GOOGLE_GENAI_API_KEY
npm run dev
```

Server listens on **port 3000** (`npx nodemon server.js`).

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

Vite dev server defaults to **http://localhost:5173**.

### 3. Production build (frontend only)

```bash
cd Frontend
npm run build
npm run preview   # optional local preview of the build
```

## API overview

Base URL: `http://localhost:3000`

### Auth (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Body: `username`, `email`, `password` — sets cookie |
| POST | `/login` | Body: `email`, `password` — sets cookie |
| GET | `/logout` | Blacklists token, clears cookie |
| GET | `/get-me` | **Auth required** — current user |

### Interview (`/api/interview`)

All routes below require a valid JWT cookie except where noted.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Multipart: `resume` (file), `jobDescription`, `selfDescription` — creates report |
| GET | `/` | List current user’s reports (redacted fields for list view) |
| GET | `/report/:interviewId` | Full report by ID (scoped to user) |
| POST | `/resume/pdf/:interviewReportId` | Returns PDF file (tailored resume) |

## Implementation notes

- **Resume file**: The server extracts text with `pdf-parse`. The UI allows selecting `.docx` in the file input, but only **PDF** is handled end-to-end for parsing; use PDF for reliable results.
- **File size**: Multer limits uploads to **3 MB** on the API (the home page copy mentions 5 MB in places—that is stricter on the server).
- **AI models and APIs**: Model name and SDK usage live in `Backend/src/services/ai.service.js`; update there if you switch models or API versions.

## Scripts reference

| Location | Command | Purpose |
|----------|---------|---------|
| Backend | `npm run dev` | Start API with nodemon |
| Frontend | `npm run dev` | Vite dev server |
| Frontend | `npm run build` | Production bundle |
| Frontend | `npm run lint` | ESLint |

## License

Backend `package.json` declares **ISC**. Confirm license terms for your own distribution if you change it.
