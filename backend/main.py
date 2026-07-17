"""
main.py
-------
FastAPI application entrypoint for the AI Resume Analyzer.

Exposes:
    POST /analyze  - accepts a resume file + job description file (or raw text)
                     and returns matched/missing skills, match percentage,
                     verdict, and reasons.
    GET  /health   - simple liveness check.
"""

from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai import AIServiceError, extract_skills, generate_verdict
from parser import EmptyDocumentError, UnsupportedFileTypeError, extract_text

load_dotenv()

MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "10"))
MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

app = FastAPI(
    title="AI Resume Analyzer API",
    description="Analyzes a resume against a job description using AI-driven skill extraction.",
    version="1.0.0",
)

_raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allowed_origins = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeResponse(BaseModel):
    matchedSkills: list[str]
    missingSkills: list[str]
    matchPercentage: int
    verdict: str
    reasons: list[str]


class ErrorResponse(BaseModel):
    detail: str


def _normalize(skill: str) -> str:
    return skill.strip().lower()


def _compute_match(resume_skills: list[str], jd_skills: list[str]) -> tuple[list[str], list[str], int]:
    """Case-insensitively match jd_skills against resume_skills."""
    resume_normalized = {_normalize(s): s for s in resume_skills}

    matched: list[str] = []
    missing: list[str] = []
    seen_normalized: set[str] = set()

    for skill in jd_skills:
        norm = _normalize(skill)
        if norm in seen_normalized:
            continue
        seen_normalized.add(norm)

        if norm in resume_normalized:
            matched.append(skill)
        else:
            missing.append(skill)

    total = len(matched) + len(missing)
    match_percentage = round((len(matched) / total) * 100) if total > 0 else 0

    return matched, missing, match_percentage


async def _read_file_or_400(file: UploadFile, label: str) -> str:
    if file.size is not None and file.size > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"{label} exceeds the {MAX_UPLOAD_MB}MB upload limit.",
        )
    try:
        return await extract_text(file)
    except UnsupportedFileTypeError as exc:
        raise HTTPException(status_code=400, detail=f"{label}: {exc}") from exc
    except EmptyDocumentError as exc:
        raise HTTPException(status_code=400, detail=f"{label}: {exc}") from exc


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post(
    "/analyze",
    response_model=AnalyzeResponse,
    responses={400: {"model": ErrorResponse}, 502: {"model": ErrorResponse}},
)
async def analyze(
    resume: UploadFile = File(..., description="Resume file (PDF or DOCX)"),
    job_description: UploadFile | None = File(
        None, description="Job description file (PDF, DOCX or TXT)"
    ),
    job_description_text: str | None = Form(
        None, description="Job description as raw pasted text (alternative to a file)"
    ),
) -> AnalyzeResponse:
    if job_description is None and not (job_description_text and job_description_text.strip()):
        raise HTTPException(
            status_code=400,
            detail="Provide a job description either as a file or as pasted text.",
        )

    resume_text = await _read_file_or_400(resume, "Resume")

    if job_description is not None:
        jd_text = await _read_file_or_400(job_description, "Job description")
    else:
        jd_text = (job_description_text or "").strip()
        if not jd_text:
            raise HTTPException(status_code=400, detail="Job description text is empty.")

    try:
        skills = await extract_skills(resume_text, jd_text)
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=f"Skill extraction failed: {exc}") from exc

    matched, missing, match_percentage = _compute_match(
        skills["resume_skills"], skills["jd_skills"]
    )

    try:
        verdict_data = await generate_verdict(matched, missing, match_percentage)
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=f"Verdict generation failed: {exc}") from exc

    return AnalyzeResponse(
        matchedSkills=matched,
        missingSkills=missing,
        matchPercentage=match_percentage,
        verdict=verdict_data["verdict"],
        reasons=verdict_data["reasons"],
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
