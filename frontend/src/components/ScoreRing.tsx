interface ScoreRingProps {
  percentage: number;
}

function getColor(percentage: number): { stroke: string; text: string } {
  if (percentage >= 75) {
    return { stroke: "#16a34a", text: "text-emerald-600" };
  }
  if (percentage >= 45) {
    return { stroke: "#f59e0b", text: "text-amber-500" };
  }
  return { stroke: "#ef4444", text: "text-red-500" };
}

export default function ScoreRing({ percentage }: ScoreRingProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clamped / 100) * circumference;
  const { stroke, text } = getColor(clamped);

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-100 dark:text-slate-800"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${text}`}>{clamped}%</span>
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">match</span>
      </div>
    </div>
  );
}