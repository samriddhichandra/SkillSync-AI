import { useState, useEffect } from "react";
import type { AnalysisResult, Verdict } from "../types";
import ScoreRing from "./ScoreRing";

interface ResultsCardProps {
  result: AnalysisResult;
}

const VERDICT_STYLES: Record<Verdict, { badge: string; icon: string }> = {
  Qualified: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    icon: "✅",
  },
  "Almost There": {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    icon: "🟡",
  },
  "Not Yet": {
    badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    icon: "🔴",
  },
};

function SkillPill({ skill, variant }: { skill: string; variant: "matched" | "missing" }) {
  const styles =
    variant === "matched"
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30"
      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${styles}`}>
      {variant === "matched" ? (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {skill}
    </span>
  );
}

export default function ResultsCard({ result }: ResultsCardProps) {
  const [showCheck, setShowCheck] = useState(false);
  const verdictStyle = VERDICT_STYLES[result.verdict];

  useEffect(() => {
    const timer = setTimeout(() => setShowCheck(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animate-slide-up rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-8 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
      <div className="flex flex-col items-center gap-6 border-b border-slate-100 pb-6 text-center sm:flex-row sm:justify-between sm:text-left dark:border-slate-800">
        <div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${verdictStyle.badge}`}
          >
            <span>{verdictStyle.icon}</span>
            {result.verdict}
          </span>
          <h2 className="mt-3 text-xl font-bold text-slate-800 dark:text-slate-100">
            Analysis Complete
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {result.matchedSkills.length} of{" "}
            {result.matchedSkills.length + result.missingSkills.length} required skills found
            in your resume.
          </p>
        </div>
        <ScoreRing percentage={result.matchPercentage} />
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Why this verdict
        </h3>
        <ul className="space-y-2">
          {result.reasons.map((reason, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
            >
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                {idx + 1}
              </span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Matched Skills ({result.matchedSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.matchedSkills.length > 0 ? (
              result.matchedSkills.map((skill, idx) => (
                <span 
                  key={skill} 
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 border-amber-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 transition-all duration-500 ${showCheck ? 'scale-100' : 'scale-95'}`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">No skills matched.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Missing Skills ({result.missingSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.missingSkills.length > 0 ? (
              result.missingSkills.map((skill) => (
                <SkillPill key={skill} skill={skill} variant="missing" />
              ))
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">No missing skills — great fit!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}