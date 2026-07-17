interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Analyzing..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 animate-fade-in">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-amber-100 dark:border-slate-800" />
        <div className="absolute inset-0 animate-spin-slow rounded-full border-4 border-transparent border-t-amber-500 border-r-amber-500 dark:border-t-emerald-500 dark:border-r-emerald-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{message}</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          This usually takes a few seconds
        </p>
      </div>
    </div>
  );
}