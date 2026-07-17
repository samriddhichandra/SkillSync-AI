# AI Resume Analyzer

Upload a resume and a job description and get an instant, AI-powered breakdown of matched skills, missing skills, a match percentage, and a hiring verdict with reasons.

![Job Description Input](<public/Screenshot%202026-07-17%20213124.png>)
![Analysis Results](<public/Screenshot%202026-07-17%20213148.png>)

![Upload Screen](<public/Screenshot%202026-07-17%20213016.png>)
![Results Screen](<public/Screenshot%202026-07-17%20213036.png>)

## Overview

AI Resume Analyzer is a full-stack web application that helps job seekers evaluate how well their resume fits a target job description. Using Groq's Llama 3.3-70b, it extracts technical skills from both documents, computes a deterministic match score, and generates a hiring verdict with supporting reasons — the same evaluation a technical recruiter would do manually, automated end to end.

This repo was built to satisfy two related take-home assignments (Skill Gap Checker and Fit Verdict). See [Assignment Mapping](#assignment-mapping) below for exactly how each requirement is implemented.

## Assignment Mapping

Both assignments compare the same resume against the same job description, so they're implemented as one continuous pipeline rather than two separate apps — a single upload produces both outputs in one pass, avoiding re-uploading and re-parsing the same files twice.

| Assignment | Requirement | Implementation |
|---|---|---|
| **1. Skill Gap Checker** | Extract skills from resume + JD using AI | `extract_skills()` in `backend/ai.py` — one Groq call, JSON-mode structured output |
| | Matched Skills | `_compute_match()` in `backend/main.py` — case-insensitive set intersection |
| | Missing Skills | Same function — JD skills not present in the resume set |
| | Match Percentage | `round(matched / total * 100)`, computed in Python (deterministic, not AI-generated) |
| **2. Fit Verdict** | AI-generated verdict (Qualified / Almost There / Not Yet) | `generate_verdict()` in `backend/ai.py` — second Groq call, seeded with Assignment 1's output |
| | Three concise reasons | Same call, returned as a `reasons` array, validated server-side |

Both outputs are rendered together on a single results screen (`ResultsCard.tsx`) — score ring + skill pills for Assignment 1, verdict badge + reasons list for Assignment 2.

## Architecture

### System overview

```
┌──────────────────────┐         ┌───────────────────────────┐           ┌─────────────────┐
│   Browser (Client)   │         │   FastAPI Backend (API)     │         │   Groq Cloud     │
│                      │         │                             │         │   (Llama 3.3-70b)│
│  React + Vite + TS   │  HTTPS  │  main.py    → routing       │  HTTPS  │                  │
│  TailwindCSS         │────────▶│  parser.py  → text extract  │────────▶│Chat Completions│
│                      │  multi- │  ai.py      → Groq calls    │  JSON   │  (JSON mode)     │
│  FileUpload          │  part   │                             │  mode   │                  │
│  JobDescriptionInput │  form   │  In-memory only — no DB,    │         │                  │
│  ResultsCard         │         │  no disk writes, no queue   │         │                  │
└──────────────────────┘         └───────────────────────────┘           └─────────────────┘
```

### Request flow (`POST /analyze`)

```
1. Client uploads resume (PDF/DOCX) + JD (file or pasted text)
        │
2. FastAPI validates file size + type, rejects early on 400
        │
3. parser.py extracts raw text
   (pdfplumber for PDF, python-docx for DOCX, direct decode for TXT)
        │
4. ai.py → extract_skills()          [Groq call #1]
   Single JSON-mode completion returns:
   { "resume_skills": [...], "jd_skills": [...] }
        │
5. main.py → _compute_match()
   Deterministic, non-AI comparison:
   matchedSkills, missingSkills, matchPercentage
        │
6. ai.py → generate_verdict()        [Groq call #2]
   Seeded with step 5's output, returns:
   { "verdict": "...", "reasons": [...] }
        │
7. FastAPI returns a single AnalyzeResponse to the client
```

**Why two AI calls instead of one:** separating skill extraction from verdict generation keeps each prompt focused on a single task, makes each step independently testable/mockable, and lets the match percentage stay deterministic (computed in Python) rather than something the model has to compute and could get wrong. The trade-off is added latency (~2 sequential LLM round-trips instead of 1).

### Component responsibilities

| Layer | File | Responsibility |
|---|---|---|
| Routing / validation | `backend/main.py` | Request handling, file-size limits, error mapping (400/502), score computation |
| Document parsing | `backend/parser.py` | PDF/DOCX/TXT → plain text, with `UnsupportedFileTypeError` / `EmptyDocumentError` |
| AI integration | `backend/ai.py` | Groq client, prompt templates, JSON-mode calls, response validation |
| UI shell | `frontend/src/App.tsx` | Page state machine (landing → upload → loading → results) |
| Upload UX | `FileUpload.tsx`, `JobDescriptionInput.tsx` | Drag-and-drop, file/text mode toggle |
| Results UX | `ResultsCard.tsx`, `ScoreRing.tsx` | Renders both assignments' output together |
| API client | `frontend/src/lib/api.ts` | Typed fetch wrapper, maps backend errors to `ApiError` |

### Data flow guarantees

- **No persistence**: uploaded files are read into memory (`await file.read()`), processed, and discarded when the request completes. Nothing touches disk, no database, no session storage.
- **No logging of document content**: only request metadata (status codes, timing) would be logged in a production deployment — resume/JD text is never written to logs.
- **Stateless backend**: every `/analyze` call is independent; the service can be horizontally scaled behind a load balancer with zero shared state.

## Tech Stack

| Component    | Technology                            |
| ------------ | ------------------------------------- |
| Frontend     | React + Vite, TypeScript, TailwindCSS |
| Backend      | FastAPI, Python, Groq API             |
| File Parsing | pdfplumber, python-docx               |
| AI Model     | Llama 3.3-70b-versatile (via Groq)    |

## Features

- Drag & Drop Upload - Support for PDF and DOCX resume files
- Flexible Job Description Input - Upload PDF/DOCX/TXT files or paste text directly
- AI-Powered Analysis - Two-pass analysis for technical skill extraction and hiring verdict
- Match Percentage - Visual score ring showing compatibility with the job
- Detailed Insights - Matched skills, missing skills, and personalized reasons
- Responsive Design - Modern gradient UI with dark mode toggle
- Privacy Focused - Files processed in memory, never stored on disk

## Project Structure

```
SkillSync-AI/
├── frontend/                 # React + Vite + TypeScript + Tailwind app
│   ├── src/
│   │   ├── components/       # FileUpload, JobDescriptionInput, ResultsCard, ScoreRing, ...
│   │   ├── lib/api.ts         # Typed API client
│   │   ├── types.ts            # Shared TS types (AnalysisResult, Verdict, ApiError)
│   │   └── App.tsx
│   ├── public/
│   └── package.json
├── backend/                  # FastAPI service
│   ├── main.py                # Routes, validation, matching logic
│   ├── ai.py                    # Groq prompts + calls
│   ├── parser.py                # PDF/DOCX/TXT text extraction
│   └── requirements.txt
├── docs/                      # Documentation and screenshots
├── public/                    # README screenshots
├── README.md
└── .gitignore
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Groq API Key - Get one at [console.groq.com](https://console.groq.com/keys)

## Setup & Installation

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env and set your GROQ_API_KEY
```

Environment Variables (backend/.env):

| Variable      | Description                  | Default                                     |
| ------------- | ---------------------------- | ------------------------------------------- |
| GROQ_API_KEY  | Your Groq API key (required) | -                                           |
| GROQ_MODEL    | Model for extraction/verdict | llama-3.3-70b-versatile                     |
| CORS_ORIGINS  | Allowed frontend origins     | http://localhost:5173,http://127.0.0.1:5173 |
| MAX_UPLOAD_MB | Max file size in MB          | 10                                          |

### 2. Frontend Setup

```bash
cd frontend
npm install

# Environment is pre-configured for local development
# VITE_API_BASE_URL=http://localhost:8000
```

## Running the Application

### Start the Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

API available at http://localhost:8000 with interactive docs at http://localhost:8000/docs

### Start the Frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser

## Usage

1. Drag & drop (or browse to) a resume file - PDF or DOCX
2. Provide a job description via file upload (PDF/DOCX/TXT) or paste text
3. Click Analyze Resume
4. Review the match percentage, verdict, matched skills, and missing skills

## API Reference

### GET /health

Liveness check, returns `{ "status": "ok" }`. Used by load balancers / uptime monitors in a production deployment.

### POST /analyze

Analyzes a resume against a job description.

Request Body (multipart/form-data):

| Field                | Type   | Required | Notes            |
| -------------------- | ------ | -------- | ---------------- |
| resume               | file   | yes      | PDF or DOCX      |
| job_description      | file   | no*      | PDF, DOCX or TXT |
| job_description_text | string | no*      | Raw pasted text  |

*Either job_description or job_description_text must be provided.

Success Response (200):

```json
{
  "matchedSkills": ["React", "TypeScript", "Node.js"],
  "missingSkills": ["GraphQL", "Docker"],
  "matchPercentage": 78,
  "verdict": "Almost There",
  "reasons": [
    "Strong overlap in frontend frameworks like React and TypeScript.",
    "Missing containerization experience with Docker.",
    "No GraphQL experience found, which the role requires."
  ]
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid/empty/oversized file, unsupported file type, or missing job description |
| 502 | Groq API failure, timeout, or malformed/unparseable AI response |

## Production Build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
# Or, for a production-grade ASGI setup:
# gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

Serve `frontend/dist` with any static host (Vercel, Netlify, Nginx) and configure `VITE_API_BASE_URL` to point to your deployed backend.

### Suggested production deployment

```
┌────────────┐      ┌────────────────┐      ┌──────────────────────┐
│  Vercel /   │─────▶│   CDN / Edge    │─────▶│  FastAPI (Render /    │
│  Netlify    │      │   (static SPA)  │      │  Fly.io / Railway),    │
│  (frontend) │      │                 │      │  behind HTTPS + CORS   │
└────────────┘      └────────────────┘      │  locked to frontend    │
                                              │  origin, N stateless   │
                                              │  replicas behind LB    │
                                              └──────────────────────┘
                                                         │
                                                         ▼
                                                 ┌────────────────┐
                                                 │   Groq API      │
                                                 └────────────────┘
```

Because the backend is fully stateless (no DB, no session, no disk writes), scaling horizontally is just adding replicas behind a load balancer — no sticky sessions or shared cache required.

## Privacy & Security

- All uploaded files are processed in memory and never written to disk
- No data is stored or logged
- CORS restricted to explicitly allowed origins (`CORS_ORIGINS` env var)
- File size capped server-side (`MAX_UPLOAD_MB`) to prevent oversized-payload abuse
- Scanned/image-only PDFs without extractable text will return a clear 400 error (OCR not included)
- `GROQ_API_KEY` is never exposed to the client — all AI calls happen server-side

## Assumptions & Trade-offs

- **One combined app instead of two separate ones** — both assignments operate on the same resume/JD pair, so chaining them (skills → match → verdict) in a single pipeline avoids duplicate uploads and duplicate parsing.
- **Two sequential Groq calls** rather than one combined prompt — slightly higher latency (~2 round-trips), but each prompt stays focused and each step is independently testable and debuggable.
- **Match percentage is deterministic**, computed in Python from the AI-extracted skill lists rather than asked of the model directly — this keeps the score reproducible and auditable instead of a black-box number that could vary between identical inputs.
- **No OCR support** — scanned/image-only PDFs fail with an explicit error rather than silently returning an empty or misleading result.
- **Case-insensitive exact matching after AI normalization** (e.g., "ReactJS" → "React") — no fuzzy/semantic matching, so near-synonyms not normalized identically by the model (e.g., "Postgres" vs "PostgreSQL") may not match.
- **No authentication/rate limiting** in this take-home scope — a production deployment would add both (e.g., API key or JWT auth, and per-IP rate limiting) before exposing the `/analyze` endpoint publicly, since each call incurs a real Groq API cost.
- **Synchronous request/response** rather than a background job queue — acceptable for single-document analysis (a few seconds), but a batch-processing feature (multiple resumes at once) would need an async task queue (e.g., Celery/RQ) instead.

## License

MIT License - Feel free to use and modify for your needs.
