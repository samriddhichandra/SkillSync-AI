import { ApiError, type AnalysisResult } from "../types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

interface AnalyzeParams {
  resume: File;
  jobDescriptionFile: File | null;
  jobDescriptionText: string;
}

/**
 * Calls POST /analyze on the backend with the resume file and either a
 * job description file or pasted text.
 */
export async function analyzeResume({
  resume,
  jobDescriptionFile,
  jobDescriptionText,
}: AnalyzeParams): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("resume", resume);

  if (jobDescriptionFile) {
    formData.append("job_description", jobDescriptionFile);
  } else {
    formData.append("job_description_text", jobDescriptionText);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch (networkError) {
    throw new ApiError(
      "Could not reach the analysis server. Make sure the backend is running.",
      0
    );
  }

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}.`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body?.detail) detail = body.detail;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new ApiError(detail, response.status);
  }

  return (await response.json()) as AnalysisResult;
}
