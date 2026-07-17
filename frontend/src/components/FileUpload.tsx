import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from "react";

interface FileUploadProps {
  label: string;
  description: string;
  acceptedExtensions: string[];
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({
  label,
  description,
  acceptedExtensions,
  file,
  onFileSelect,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptString = acceptedExtensions.join(",");

  const validateAndSet = useCallback(
    (candidate: File) => {
      const extension = "." + candidate.name.split(".").pop()?.toLowerCase();
      if (!acceptedExtensions.includes(extension)) {
        return;
      }
      onFileSelect(candidate);
      setShowCheck(true);
      setTimeout(() => setShowCheck(false), 1000);
    },
    [acceptedExtensions, onFileSelect]
  );

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) validateAndSet(dropped);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) validateAndSet(selected);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`group relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200
          ${
            isDragging
              ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 scale-[1.01]"
              : "border-slate-300 bg-white/60 hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-brand-500 dark:hover:bg-slate-800/60"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptString}
          onChange={handleChange}
          className="hidden"
        />

        {file ? (
          <div className="flex flex-col items-center gap-1 animate-fade-in">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {showCheck && (
                <span className="absolute inset-0 -z-10 animate-check-glow rounded-xl bg-amber-200 dark:animate-check-glow-dark dark:bg-emerald-800/30" />
              )}
              <svg 
                className={`h-6 w-6 transition-transform duration-300 ${showCheck ? 'animate-check-pop' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="max-w-[220px] truncate text-sm font-medium text-slate-800 dark:text-slate-100">
              {file.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="mt-1 text-xs font-medium text-red-500 hover:text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-amber-100 group-hover:text-amber-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-emerald-900/30 dark:group-hover:text-emerald-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 8.25L12 3.75m0 0L7.5 8.25M12 3.75v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Drag & drop, or <span className="text-amber-600 dark:text-emerald-400">browse</span>
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{description}</p>
          </>
        )}
      </div>
    </div>
  );
}