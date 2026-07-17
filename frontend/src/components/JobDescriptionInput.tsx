import type { JobDescriptionMode } from "../types";
import FileUpload from "./FileUpload";

interface JobDescriptionInputProps {
  mode: JobDescriptionMode;
  onModeChange: (mode: JobDescriptionMode) => void;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  text: string;
  onTextChange: (text: string) => void;
}

export default function JobDescriptionInput({
  mode,
  onModeChange,
  file,
  onFileSelect,
  text,
  onTextChange,
}: JobDescriptionInputProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Job Description
        </label>
        <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-medium dark:bg-slate-800">
          <button
            type="button"
            onClick={() => onModeChange("file")}
            className={`rounded-md px-3 py-1 transition-colors ${
              mode === "file"
                ? "bg-white text-amber-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Upload file
          </button>
          <button
            type="button"
            onClick={() => onModeChange("text")}
            className={`rounded-md px-3 py-1 transition-colors ${
              mode === "text"
                ? "bg-white text-amber-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Paste text
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <FileUpload
          label=""
          description="PDF, DOCX or TXT"
          acceptedExtensions={[".pdf", ".docx", ".txt"]}
          file={file}
          onFileSelect={onFileSelect}
        />
      ) : (
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste the job description here..."
          rows={7}
          className="w-full resize-none rounded-2xl border-2 border-slate-300 bg-white/60 p-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-amber-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500"
        />
      )}
    </div>
  );
}