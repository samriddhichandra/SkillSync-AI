export type Verdict = "Qualified" | "Almost There" | "Not Yet";

export interface AnalysisResult {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  verdict: Verdict;
  reasons: string[];
}

export type JobDescriptionMode = "file" | "text";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
