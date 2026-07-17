"""
ai.py
-----
Wraps all Groq API calls used by the resume analyzer:
  1. extract_skills()   -> pulls technical skills out of resume + JD text
  2. generate_verdict()  -> given matched/missing skills, produces a verdict

Uses the official Groq SDK with open-source models like Llama 3.3-70b.
"""

from __future__ import annotations

import json
import os

from groq import AsyncGroq, GroqError

MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

_client: AsyncGroq | None = None


class AIServiceError(Exception):
    """Raised when the Groq API call fails or returns an unusable response."""


def get_client() -> AsyncGroq:
    """Lazily instantiate a Groq client so import doesn't fail without a key."""
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise AIServiceError(
                "GROQ_API_KEY is not set. Copy backend/.env.example to backend/.env "
                "and add your key from https://console.groq.com/keys."
            )
        _client = AsyncGroq(api_key=api_key)
    return _client


def _safe_json_parse(raw: str) -> dict:
    """Parse a JSON object out of a model response, stripping code fences if present."""
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise AIServiceError(f"AI returned malformed JSON: {exc}") from exc


SKILLS_SYSTEM_PROMPT = """You are a precise technical recruiter assistant.
You extract ONLY concrete, technical, hard skills from documents:
programming languages, frameworks, libraries, databases, cloud platforms,
tools, protocols, and well-defined technical methodologies (e.g. "REST APIs",
"CI/CD", "Docker", "React", "PostgreSQL", "Kubernetes").

Do NOT include soft skills (e.g. "communication", "teamwork"), job titles,
company names, degrees, or vague phrases (e.g. "problem solving").

Normalize casing/spelling of well-known technologies (e.g. "ReactJS" -> "React",
"Node" -> "Node.js"). Remove duplicates.

Respond with ONLY a valid JSON object, no markdown, no commentary, in exactly
this shape:
{"resume_skills": ["skill1", "skill2"], "jd_skills": ["skill1", "skill2"]}
"""

VERDICT_SYSTEM_PROMPT = """You are an experienced technical hiring manager.
Given a candidate's matched skills, missing skills, and match percentage
against a job description, produce a fair, encouraging but honest verdict.

Respond with ONLY a valid JSON object, no markdown, no commentary, in exactly
this shape:
{"verdict": "Qualified" | "Almost There" | "Not Yet", "reasons": ["reason 1", "reason 2", "reason 3"]}

Rules for verdict:
- "Qualified": match percentage is high (roughly 75%+) and no critical skills are missing.
- "Almost There": moderate match (roughly 45-74%) or a few important gaps.
- "Not Yet": low match (below 45%) or several critical skills missing.

Provide exactly 3 concise reasons (each under 20 words) that reference specific
skills where relevant.
"""


async def extract_skills(resume_text: str, jd_text: str) -> dict:
    """Call the AI once to extract technical skills from both documents."""
    client = get_client()

    user_prompt = (
        "RESUME TEXT:\n"
        f"{resume_text[:12000]}\n\n"
        "JOB DESCRIPTION TEXT:\n"
        f"{jd_text[:12000]}\n\n"
        "Extract the technical skills as instructed."
    )

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            temperature=0,
            messages=[
                {"role": "system", "content": SKILLS_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )
    except GroqError as exc:
        raise AIServiceError(f"Groq request failed during skill extraction: {exc}") from exc

    raw_content = response.choices[0].message.content or ""
    data = _safe_json_parse(raw_content)

    resume_skills = data.get("resume_skills", [])
    jd_skills = data.get("jd_skills", [])

    if not isinstance(resume_skills, list) or not isinstance(jd_skills, list):
        raise AIServiceError("AI response did not contain valid skill lists.")

    resume_skills = [str(s).strip() for s in resume_skills if str(s).strip()]
    jd_skills = [str(s).strip() for s in jd_skills if str(s).strip()]

    return {"resume_skills": resume_skills, "jd_skills": jd_skills}


async def generate_verdict(
    matched_skills: list[str], missing_skills: list[str], match_percentage: int
) -> dict:
    """Call the AI a second time to generate a hiring verdict + reasons."""
    client = get_client()

    user_prompt = (
        f"Matched skills ({len(matched_skills)}): {', '.join(matched_skills) or 'none'}\n"
        f"Missing skills ({len(missing_skills)}): {', '.join(missing_skills) or 'none'}\n"
        f"Match percentage: {match_percentage}%\n\n"
        "Return the verdict as instructed."
    )

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            temperature=0.3,
            messages=[
                {"role": "system", "content": VERDICT_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )
    except GroqError as exc:
        raise AIServiceError(f"Groq request failed during verdict generation: {exc}") from exc

    raw_content = response.choices[0].message.content or ""
    data = _safe_json_parse(raw_content)

    verdict = str(data.get("verdict", "")).strip()
    reasons = data.get("reasons", [])

    if verdict not in {"Qualified", "Almost There", "Not Yet"}:
        raise AIServiceError(f"AI returned an unexpected verdict value: '{verdict}'")

    if not isinstance(reasons, list) or not reasons:
        raise AIServiceError("AI response did not contain a valid reasons list.")

    reasons = [str(r).strip() for r in reasons if str(r).strip()]

    return {"verdict": verdict, "reasons": reasons}