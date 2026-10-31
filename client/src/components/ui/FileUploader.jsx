import { Upload, X, FileImage } from 'lucide-react';
import { useState } from 'react';

// FileUploaderProps interface removed (TypeScript only)

export function FileUploader({ label = 'Upload files', accept = 'image/*', multiple = true, hint }) {
  const [files, setFiles] = useState([]);

  const onDrop = (e) => {
    const list = e.target.files;
    if (!list) return;
    const names = Array.from(list).map((f) => f.name);
    setFiles((prev) => (multiple ? [...prev, ...names] : names));
  };

  return (
    <div>
      <label className="block w-full cursor-pointer">
        <div className="border-2 border-dashed border-slate-300 rounded-xl px-4 py-6 text-center hover:border-navy-400 hover:bg-navy-50/50 transition">
          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <div className="text-sm font-medium text-navy-700">{label}</div>
          {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
          <input type="file" accept={accept} multiple={multiple} className="hidden" onChange={onDrop} />
        </div>
      </label>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-sm text-navy-700 truncate">
                <FileImage className="w-4 h-4 text-navy-400 shrink-0" />
                <span className="truncate">{f}</span>
              </div>
              <button
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-slate-400 hover:text-rose-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

