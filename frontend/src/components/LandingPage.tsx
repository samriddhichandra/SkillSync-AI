import { useState, useEffect } from "react";

interface LandingPageProps {
  onGetStarted: () => void;
}

function usePrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(usePrefersDark);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const features = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "AI-Powered Analysis",
      description: "Advanced AI analyzes your resume against job requirements in seconds",
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A7.5 7.5 0 1112 21a7.5 7.5 0 01-7.5-7.5c0-1.697.5-3.262 1.322-4.516L12 21l4.678-7.016z" />
        </svg>
      ),
      title: "Match Score",
      description: "Get a detailed compatibility score with actionable insights",
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018 4.5H6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 006 22.5zm6-10.5V7.5m0 0l-3 3m3-3l3 3" />
        </svg>
      ),
      title: "Privacy First",
      description: "Your files are processed in-memory and never stored on our servers",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-brand-300/30 to-amber-300/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-300/30 to-brand-300/30 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-200/20 to-emerald-200/20 blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-12 sm:px-6">
        {/* Header */}
        <header className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                AI Resume Analyzer
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDark((d) => !d)}
            aria-label="Toggle dark mode"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-600 shadow-sm backdrop-blur transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isDark ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1.5m0 15V21m8.485-8.485H21M3 12h1.515m12.728-6.728l-1.06 1.06M6.817 17.243l-1.06 1.06m0-12.728l1.06 1.06m10.911 10.911l1.06 1.06M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.752 15.002A9.72 9.72 0 1118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
        </header>

        {/* Hero Section */}
        <main className="flex-1">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl md:text-6xl">
                <span className="block">Land Your Dream Job</span>
                <span className="block bg-gradient-to-r from-brand-600 to-amber-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-emerald-400">
                  With AI-Powered Precision
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                Upload your resume and job description to get instant, AI-driven insights on how well you match. 
                Get actionable feedback to optimize your application and increase your chances of getting hired.
              </p>
            </div>

            {/* CTA Button */}
            <div className={`mt-10 transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <button
                onClick={onGetStarted}
                className="group relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 px-10 py-4 text-lg font-semibold text-white shadow-xl shadow-amber-500/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/40 dark:from-emerald-600 dark:to-emerald-800 dark:shadow-emerald-600/30 dark:hover:shadow-emerald-600/40"
              >
                <span className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-30 transition-opacity">
                  <span className="absolute h-1 w-1 animate-ping rounded-full bg-white" style={{ top: '20%', left: '10%' }} />
                  <span className="absolute h-1 w-1 animate-ping rounded-full bg-white" style={{ top: '60%', left: '80%' }} />
                  <span className="absolute h-1 w-1 animate-ping rounded-full bg-white" style={{ top: '40%', left: '50%' }} />
                </span>
                Get Started
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

            {/* Features Grid */}
            <div className={`mt-20 transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group relative"
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 opacity-0 blur transition-all duration-300 ${
                      hoveredFeature === index ? "opacity-30" : ""
                    }`} />
                    <div className="relative rounded-2xl border border-slate-200 bg-white/80 p-6 backdrop-blur transition-all duration-300 hover:scale-105 dark:border-slate-800 dark:bg-slate-900/70">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-amber-100 text-brand-600 transition-all duration-300 group-hover:from-brand-500 group-hover:to-amber-600 group-hover:text-white dark:from-brand-900/30 dark:to-amber-900/30 dark:text-amber-300 dark:group-hover:text-white">
                        {feature.icon}
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo Preview */}
            <div className={`mt-20 transition-all duration-1000 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="relative mx-auto max-w-3xl">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-brand-500 to-amber-500 opacity-20 blur-xl" />
                <div className="relative rounded-2xl border border-slate-200 bg-white/90 p-1 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="rounded-xl bg-white p-6 dark:bg-slate-900">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border-2 border-dashed border-slate-300 p-4 dark:border-slate-700">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Resume</p>
                        <div className="mt-2 h-24 rounded bg-slate-100 dark:bg-slate-800" />
                      </div>
                      <div className="rounded-lg border-2 border-dashed border-slate-300 p-4 dark:border-slate-700">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Job Description</p>
                        <div className="mt-2 h-24 rounded bg-slate-100 dark:bg-slate-800" />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <div className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-2 text-sm font-medium text-white dark:from-emerald-600 dark:to-emerald-800">
                        Analyze Resume
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-slate-400 dark:text-slate-600">
          Built with React, FastAPI & OpenAI — your files are analyzed in-memory and never stored.
        </footer>
      </div>
    </div>
  );
}