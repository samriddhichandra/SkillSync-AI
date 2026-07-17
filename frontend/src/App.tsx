import { useEffect, useState } from "react";
import LandingPage from "./components/LandingPage";
import FileUpload from "./components/FileUpload";
import JobDescriptionInput from "./components/JobDescriptionInput";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import ResultsCard from "./components/ResultsCard";
import ThemeToggle from "./components/ThemeToggle";
import { analyzeResume } from "./lib/api";
import { ApiError, type AnalysisResult, type JobDescriptionMode } from "./types";

function usePrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(usePrefersDark);
  const [showLanding, setShowLanding] = useState(true);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdMode, setJdMode] = useState<JobDescriptionMode>("file");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleReset = () => {
    setResumeFile(null);
    setJdFile(null);
    setJdText("");
    setResult(null);
    setError(null);
    setShowLanding(true);
  };

  // Show landing page
  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  const jdReady = jdMode === "file" ? jdFile !== null : jdText.trim().length > 0;
  const canAnalyze = resumeFile !== null && jdReady && !isLoading;

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError("Please upload a resume before analyzing.");
      return;
    }
    if (!jdReady) {
      setError("Please provide a job description, either as a file or pasted text.");
      return;
    }

    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const analysis = await analyzeResume({
        resume: resumeFile,
        jobDescriptionFile: jdMode === "file" ? jdFile : null,
        jobDescriptionText: jdMode === "text" ? jdText : "",
      });
      setResult(analysis);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something unexpected went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-10 sm:px-6">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                AI Resume Analyzer
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Match your resume against any job description
              </p>
            </div>
          </div>
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
        </header>

        <main className="flex-1">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-8 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FileUpload
                label="Resume"
                description="PDF or DOCX"
                acceptedExtensions={[".pdf", ".docx"]}
                file={resumeFile}
                onFileSelect={setResumeFile}
              />
              <JobDescriptionInput
                mode={jdMode}
                onModeChange={setJdMode}
                file={jdFile}
                onFileSelect={setJdFile}
                text={jdText}
                onTextChange={setJdText}
              />
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className={`relative w-full rounded-2xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:w-auto overflow-hidden
                  ${canAnalyze 
                    ? "bg-gradient-to-r from-amber-400 to-amber-600 shadow-amber-400/30 hover:shadow-amber-400/40 dark:from-emerald-600 dark:to-emerald-800 dark:shadow-emerald-600/30 dark:hover:shadow-emerald-600/40" 
                    : "bg-gradient-to-r from-brand-500 to-brand-700 shadow-brand-500/30"
                  }`}
              >
                {canAnalyze && (
                  <span className="absolute inset-0 -z-10 opacity-30">
                    <span className="absolute h-1 w-1 animate-ping rounded-full bg-white" style={{ top: '20%', left: '10%' }} />
                    <span className="absolute h-1 w-1 animate-ping rounded-full bg-white" style={{ top: '60%', left: '80%' }} />
                    <span className="absolute h-1 w-1 animate-ping rounded-full bg-white" style={{ top: '40%', left: '50%' }} />
                  </span>
                )}
                {isLoading ? "Analyzing..." : "Analyze Resume"}
              </button>
              {(result || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full rounded-2xl border border-slate-300 px-8 py-3.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
                >
                  Start Over
                </button>
              )}
            </div>
          </div>

          <div className="mt-8">
            {isLoading && <LoadingSpinner />}
            {!isLoading && error && (
              <ErrorMessage message={error} onDismiss={() => setError(null)} />
            )}
            {!isLoading && result && <ResultsCard result={result} />}
          </div>
        </main>

        <footer className="mt-12 text-center text-xs text-slate-400 dark:text-slate-600">
          Built with React, FastAPI & OpenAI — your files are analyzed in-memory and never
          stored.
        </footer>
      </div>
    </div>
  );
}